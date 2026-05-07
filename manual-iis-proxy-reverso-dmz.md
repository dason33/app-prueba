# Manual de configuracion de proxy reverso IIS para WsRecepcion.svc

## 1. Objetivo

Este documento describe el procedimiento para publicar el servicio interno:

```text
http://10.42.34.202/WsRecepcion.svc
```

a traves de un proxy reverso en IIS ubicado en el servidor DMZ:

```text
10.42.32.35
```

usando la URL publica/interna:

```text
https://datamartco.bat.net/WsRecepcion.svc
```

Tambien incluye el troubleshooting aplicado para resolver problemas de limpieza de IIS, `URL Rewrite`, `Application Request Routing`, `redirection.config`, `WAS` y resolucion DNS.

---

## 2. Arquitectura esperada

```text
Cliente
  |
  | HTTPS 443
  v
Servidor DMZ IIS
10.42.32.35
datamartco.bat.net
  |
  | HTTP o HTTPS interno
  v
Servidor intranet
10.42.34.202
WsRecepcion.svc
```

El servidor DMZ recibe las solicitudes HTTPS con el certificado de `datamartco.bat.net` y las reenvia al servicio interno mediante IIS, ARR y URL Rewrite.

---

## 3. Componentes utilizados

### 3.1 IIS

Servidor web que recibe las peticiones HTTPS.

### 3.2 URL Rewrite Module 2

Modulo de IIS que permite crear reglas para reescribir o redirigir URLs. En este caso se usa para reenviar:

```text
/WsRecepcion.svc
```

hacia:

```text
http://10.42.34.202/WsRecepcion.svc
```

### 3.3 Application Request Routing, ARR

Modulo que permite a IIS actuar como proxy reverso. URL Rewrite define la regla, pero ARR ejecuta el proxy hacia el backend.

### 3.4 Server Farms

`Server Farms` es una funcionalidad de ARR para escenarios avanzados como:

- balanceo de carga entre varios servidores backend;
- health checks;
- afinidad de sesion;
- administracion de multiples nodos;
- generacion automatica de reglas de proxy.

Para este caso, donde existe un unico backend:

```text
10.42.34.202
```

no es obligatorio crear un `Server Farm`. Es normal que la seccion aparezca vacia si el proxy se configuro con una regla directa en `URL Rewrite`.

---

## 4. Prerrequisitos

### 4.1 Conectividad desde DMZ hacia intranet

En el servidor DMZ `10.42.32.35`, validar acceso al backend:

```powershell
Test-NetConnection 10.42.34.202 -Port 80
Test-NetConnection 10.42.34.202 -Port 443
```

Probar la URL real del servicio:

```powershell
Invoke-WebRequest http://10.42.34.202/WsRecepcion.svc -UseBasicParsing
Invoke-WebRequest http://10.42.34.202/WsRecepcion.svc?wsdl -UseBasicParsing
```

Si el backend usa HTTPS:

```powershell
Invoke-WebRequest https://10.42.34.202/WsRecepcion.svc -UseBasicParsing
Invoke-WebRequest https://10.42.34.202/WsRecepcion.svc?wsdl -UseBasicParsing
```

No continuar con el proxy hasta que estas pruebas respondan desde el DMZ.

### 4.2 Certificado

Debe existir un certificado valido para:

```text
datamartco.bat.net
```

El certificado debe tener llave privada y estar instalado en:

```text
Local Computer > Personal > Certificates
```

Validacion:

```powershell
Get-ChildItem Cert:\LocalMachine\My | Where-Object {
    $_.Subject -match "datamartco.bat.net" -or $_.DnsNameList -match "datamartco.bat.net"
}
```

### 4.3 DNS

El nombre debe resolver hacia la IP del DMZ:

```text
datamartco.bat.net -> 10.42.32.35
```

Validacion:

```powershell
nslookup datamartco.bat.net
Test-NetConnection datamartco.bat.net -Port 443
```

Si no existe DNS aun, se puede usar temporalmente el archivo `hosts` del equipo desde donde se prueba:

```text
C:\Windows\System32\drivers\etc\hosts
```

Agregar:

```text
10.42.32.35 datamartco.bat.net
```

Luego limpiar cache DNS:

```powershell
ipconfig /flushdns
```

---

## 5. Instalacion limpia de IIS

Ejecutar PowerShell como Administrador.

```powershell
Install-WindowsFeature Web-Server,Web-Mgmt-Console,Web-Default-Doc,Web-Static-Content,Web-Http-Errors,Web-Http-Logging,Web-Request-Monitor,Web-Filtering,Web-Stat-Compression -IncludeManagementTools
```

Validar:

```powershell
Invoke-WebRequest http://localhost -UseBasicParsing
```

Debe responder la pagina por defecto de IIS.

---

## 6. Instalacion de URL Rewrite y ARR

Instalar en este orden:

1. IIS URL Rewrite Module 2.
2. Application Request Routing ARR 3.0.

Si el servidor DMZ no tiene salida a internet, descargar los instaladores desde otro equipo y copiarlos manualmente al servidor.

Despues de instalar:

```powershell
iisreset
```

Validar en IIS Manager que existan:

- `URL Rewrite`
- `Application Request Routing Cache`

---

## 7. Habilitar proxy en ARR

Desde IIS Manager:

```text
Servidor > Application Request Routing Cache > Server Proxy Settings > Enable proxy
```

O por comando:

```powershell
%windir%\system32\inetsrv\appcmd.exe set config -section:system.webServer/proxy /enabled:"True" /preserveHostHeader:"False" /commit:apphost
iisreset
```

### Nota sobre preserveHostHeader

Inicialmente se recomienda:

```text
preserveHostHeader = False
```

Si el servicio Java/WCF necesita recibir el host publico `datamartco.bat.net`, cambiarlo a:

```powershell
%windir%\system32\inetsrv\appcmd.exe set config -section:system.webServer/proxy /preserveHostHeader:"True" /commit:apphost
iisreset
```

---

## 8. Crear el sitio en IIS

Crear carpeta del sitio:

```powershell
New-Item -ItemType Directory -Path "C:\inetpub\datamartco" -Force
Set-Content "C:\inetpub\datamartco\index.html" "DMZ IIS OK"
```

Crear sitio HTTP inicial:

```powershell
Import-Module WebAdministration

New-Website `
  -Name "datamartco.bat.net" `
  -Port 80 `
  -HostHeader "datamartco.bat.net" `
  -PhysicalPath "C:\inetpub\datamartco"
```

Agregar binding HTTPS desde IIS Manager:

```text
Site: datamartco.bat.net
Type: https
Port: 443
Host name: datamartco.bat.net
SSL certificate: certificado datamartco.bat.net
```

Validar:

```powershell
Invoke-WebRequest https://datamartco.bat.net -UseBasicParsing
```

Debe responder:

```text
DMZ IIS OK
```

---

## 9. Crear regla de proxy reverso

Crear o editar:

```text
C:\inetpub\datamartco\web.config
```

### 9.1 Backend por HTTP

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="ReverseProxy_WsRecepcion" stopProcessing="true">
          <match url="^WsRecepcion\.svc(.*)" />
          <action type="Rewrite" url="http://10.42.34.202/WsRecepcion.svc{R:1}" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

### 9.2 Backend por HTTPS

Si el servicio interno responde por HTTPS:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="ReverseProxy_WsRecepcion" stopProcessing="true">
          <match url="^WsRecepcion\.svc(.*)" />
          <action type="Rewrite" url="https://10.42.34.202/WsRecepcion.svc{R:1}" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

Aplicar:

```powershell
iisreset
```

---

## 10. Pruebas funcionales

### 10.1 Prueba del backend desde DMZ

```powershell
Invoke-WebRequest http://10.42.34.202/WsRecepcion.svc?wsdl -UseBasicParsing
```

### 10.2 Prueba del sitio DMZ

```powershell
Invoke-WebRequest https://datamartco.bat.net -UseBasicParsing
```

### 10.3 Prueba del proxy reverso

```powershell
Invoke-WebRequest https://datamartco.bat.net/WsRecepcion.svc -UseBasicParsing
Invoke-WebRequest https://datamartco.bat.net/WsRecepcion.svc?wsdl -UseBasicParsing
```

### 10.4 Prueba desde cliente

```powershell
nslookup datamartco.bat.net
Test-NetConnection datamartco.bat.net -Port 443
Invoke-WebRequest https://datamartco.bat.net/WsRecepcion.svc?wsdl -UseBasicParsing
```

---

## 11. Logs utiles

### 11.1 Logs de IIS

```text
C:\inetpub\logs\LogFiles
```

### 11.2 Event Viewer

Revisar:

```text
Windows Logs > Application
Windows Logs > System
```

### 11.3 Failed Request Tracing

Instalar tracing:

```powershell
Install-WindowsFeature Web-Http-Tracing
```

En IIS Manager:

```text
Sitio > Failed Request Tracing Rules
```

Habilitar reglas para codigos:

```text
400-599
```

---

## 12. Troubleshooting general del proxy

### 12.1 Error DNS_PROBE_FINISHED_NXDOMAIN

Significa que el equipo no puede resolver:

```text
datamartco.bat.net
```

Validar:

```powershell
nslookup datamartco.bat.net
```

Solucion temporal:

```text
10.42.32.35 datamartco.bat.net
```

en:

```text
C:\Windows\System32\drivers\etc\hosts
```

Luego:

```powershell
ipconfig /flushdns
```

Solucion definitiva: crear registro DNS interno o publico segun aplique.

### 12.2 Error 502

Indica que ARR no puede llegar al backend.

Validar desde DMZ:

```powershell
Test-NetConnection 10.42.34.202 -Port 80
Test-NetConnection 10.42.34.202 -Port 443
Invoke-WebRequest http://10.42.34.202/WsRecepcion.svc?wsdl -UseBasicParsing
```

Revisar:

- firewall entre DMZ e intranet;
- puerto real del servicio;
- si el servicio escucha en IP, hostname o solo localhost;
- si el backend exige Host Header especifico.

### 12.3 Error 404

Posibles causas:

- la regla no coincide con la URL;
- el path interno no existe;
- el sitio equivocado esta atendiendo el binding;
- falta `URL Rewrite`.

Validar:

```text
https://datamartco.bat.net/WsRecepcion.svc
https://datamartco.bat.net/WsRecepcion.svc?wsdl
```

### 12.4 Error de certificado

Validar:

- certificado con Subject o SAN `datamartco.bat.net`;
- certificado instalado en `LocalMachine\My`;
- certificado con llave privada;
- binding HTTPS correcto;
- cadena de certificados completa.

Comando:

```powershell
Get-ChildItem Cert:\LocalMachine\My | Where-Object {
    $_.Subject -match "datamartco.bat.net" -or $_.DnsNameList -match "datamartco.bat.net"
}
```

### 12.5 El WSDL muestra IP interna

Si al abrir el WSDL aparecen URLs internas como:

```text
http://10.42.34.202/...
```

entonces el backend esta generando metadata con su URL interna. Opciones:

1. ajustar configuracion del servicio backend para publicar la URL externa;
2. habilitar `preserveHostHeader`;
3. crear reglas outbound en URL Rewrite para reemplazar URLs internas por:

```text
https://datamartco.bat.net
```

---

## 13. Troubleshooting de la limpieza de IIS realizada

### 13.1 Sintoma: IIS conserva configuraciones despues de reinstalar

Causa probable:

- quedaron residuos en `C:\Windows\System32\inetsrv\config`;
- quedaron residuos en `C:\inetpub`;
- quedaron paquetes MSI externos como URL Rewrite, ARR o Web Farm Framework;
- persistio configuracion compartida de IIS.

Limpieza recomendada:

```powershell
Uninstall-WindowsFeature Web-Server,Web-Mgmt-Console,WAS,WAS-Process-Model,WAS-NET-Environment,WAS-Config-APIs
Restart-Computer
```

Luego:

```powershell
Rename-Item "C:\Windows\System32\inetsrv\config" "config.bad" -Force -ErrorAction SilentlyContinue
Rename-Item "C:\inetpub" "inetpub.bad" -Force -ErrorAction SilentlyContinue
```

### 13.2 Sintoma: URL Rewrite no desinstala

Error:

```text
Setup failed to detect shared configuration
```

El log MSI mostro:

```text
Error 30001. Setup failed to detect shared configuration.
Unable to detect whether shared configuration is in use.
Return value 3
Removal success or error status: 1603
```

Causa:

IIS no podia leer correctamente `redirection.config`, por lo cual el MSI no podia determinar si Shared Configuration estaba habilitado.

Validacion:

```powershell
& "$env:windir\system32\inetsrv\appcmd.exe" list config
```

Error observado:

```text
Filename: redirection.config
Line Number: 0
Description: Cannot read configuration file
```

### 13.3 Archivo redirection.config valido

Ruta:

```text
C:\Windows\System32\inetsrv\config\redirection.config
```

Contenido:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configurationRedirection enabled="false" path="" userName="" password="" />
```

Recrearlo:

```powershell
Stop-Service W3SVC,WAS,AppHostSvc -Force -ErrorAction SilentlyContinue

$path = "C:\Windows\System32\inetsrv\config\redirection.config"

$xml = @'
<?xml version="1.0" encoding="UTF-8"?>
<configurationRedirection enabled="false" path="" userName="" password="" />
'@

[System.IO.File]::WriteAllText(
    $path,
    $xml,
    (New-Object System.Text.UTF8Encoding($false))
)
```

Permisos:

```powershell
icacls "C:\Windows\System32\inetsrv\config\redirection.config" /inheritance:e
icacls "C:\Windows\System32\inetsrv\config\redirection.config" /grant SYSTEM:F
icacls "C:\Windows\System32\inetsrv\config\redirection.config" /grant BUILTIN\Administrators:F
```

### 13.4 Sintoma: WAS no inicia

Errores:

```text
Windows Process Activation Service (WAS) is stopping because it encountered an error.
The configuration manager for Windows Process Activation Service (WAS) did not initialize.
```

Codigo:

```text
0x8007000D
```

Significado:

```text
The data is invalid
```

Validacion:

```powershell
Get-WinEvent -LogName System -MaxEvents 30 |
Where-Object { $_.Id -in 5005,5036,9000,9006 } |
ForEach-Object {
    $raw = $_.Properties[0].Value
    if ($raw -is [byte[]]) {
        $hex = "0x{0:X8}" -f [BitConverter]::ToUInt32($raw,0)
    } else {
        $hex = "0x{0:X8}" -f $raw
    }

    [PSCustomObject]@{
        TimeCreated  = $_.TimeCreated
        Id           = $_.Id
        ProviderName = $_.ProviderName
        ErrorHex     = $hex
        Message      = $_.Message
    }
} |
Format-List
```

### 13.5 Desinstalacion de paquetes MSI externos

URL Rewrite, ARR y Web Farm Framework no son Windows Features; son paquetes MSI.

Listar:

```powershell
$paths = @(
  "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*",
  "HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*"
)

Get-ItemProperty $paths |
Where-Object {
  $_.DisplayName -match "Rewrite|Application Request Routing|Web Farm|External Cache|Web Deploy"
} |
Select-Object DisplayName, DisplayVersion, PSChildName, UninstallString |
Format-Table -AutoSize
```

Desinstalar:

```powershell
msiexec /x "{GUID}" /norestart
```

Orden recomendado:

1. Microsoft Application Request Routing.
2. Microsoft External Cache for IIS, si existe.
3. Microsoft Web Farm Framework, si existe.
4. IIS URL Rewrite Module 2.
5. Microsoft Web Deploy, si se desea limpiar y no se utiliza.

### 13.6 Desinstalacion con log

Ejemplo para URL Rewrite:

```powershell
New-Item -ItemType Directory -Path C:\Temp -Force | Out-Null

Start-Process msiexec.exe `
  -ArgumentList '/x "{9BCA2118-F753-4A1E-BCF3-5A820729965C}" /passive /norestart /L*v "C:\Temp\uninstall_urlrewrite.log"' `
  -Wait
```

Buscar errores:

```powershell
Select-String -Path C:\Temp\uninstall_urlrewrite.log `
  -Pattern "Return value 3|failed|error|shared|configuration|IIS" `
  -Context 3,3
```

---

## 14. Checklist final

Antes de dar por cerrado el cambio:

- [ ] IIS responde en `http://localhost`.
- [ ] `URL Rewrite` aparece en IIS Manager.
- [ ] `Application Request Routing Cache` aparece en IIS Manager.
- [ ] ARR proxy esta habilitado.
- [ ] El certificado de `datamartco.bat.net` esta instalado con llave privada.
- [ ] El binding HTTPS usa el certificado correcto.
- [ ] `datamartco.bat.net` resuelve hacia `10.42.32.35`.
- [ ] DMZ llega al backend `10.42.34.202`.
- [ ] `https://datamartco.bat.net/WsRecepcion.svc` responde.
- [ ] `https://datamartco.bat.net/WsRecepcion.svc?wsdl` responde.
- [ ] Logs de IIS no muestran errores 4xx/5xx inesperados.

