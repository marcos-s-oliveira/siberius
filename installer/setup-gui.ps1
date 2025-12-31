# Setup Siberius - Interface Gráfica
# PowerShell com Windows Forms

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Configurações globais
$Global:Config = @{
    BackendIP = "localhost"
    BackendPort = "3000"
    FrontendPort = "5173"
    PDFDirectory = "C:\ServiceOrder"
    DatabaseURL = "postgresql://postgres:senha@localhost:5432/siberius"
}

# Criar formulário principal
$form = New-Object System.Windows.Forms.Form
$form.Text = 'Setup Siberius'
$form.Size = New-Object System.Drawing.Size(600, 500)
$form.StartPosition = 'CenterScreen'
$form.FormBorderStyle = 'FixedDialog'
$form.MaximizeBox = $false
$form.Icon = [System.Drawing.SystemIcons]::Application

# Logo/Título
$lblTitle = New-Object System.Windows.Forms.Label
$lblTitle.Location = New-Object System.Drawing.Point(20, 20)
$lblTitle.Size = New-Object System.Drawing.Size(560, 40)
$lblTitle.Text = 'Bem-vindo ao Setup do Siberius'
$lblTitle.Font = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
$lblTitle.TextAlign = 'MiddleCenter'
$form.Controls.Add($lblTitle)

# Descrição
$lblDesc = New-Object System.Windows.Forms.Label
$lblDesc.Location = New-Object System.Drawing.Point(20, 70)
$lblDesc.Size = New-Object System.Drawing.Size(560, 30)
$lblDesc.Text = 'Sistema de gerenciamento de ordens de serviço'
$lblDesc.Font = New-Object System.Drawing.Font("Segoe UI", 10)
$lblDesc.TextAlign = 'MiddleCenter'
$form.Controls.Add($lblDesc)

# Grupo de configurações
$grpConfig = New-Object System.Windows.Forms.GroupBox
$grpConfig.Location = New-Object System.Drawing.Point(20, 120)
$grpConfig.Size = New-Object System.Drawing.Size(560, 250)
$grpConfig.Text = 'Configurações'
$grpConfig.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
$form.Controls.Add($grpConfig)

# IP do Backend
$lblBackendIP = New-Object System.Windows.Forms.Label
$lblBackendIP.Location = New-Object System.Drawing.Point(20, 30)
$lblBackendIP.Size = New-Object System.Drawing.Size(200, 20)
$lblBackendIP.Text = 'IP do Servidor Backend:'
$grpConfig.Controls.Add($lblBackendIP)

$txtBackendIP = New-Object System.Windows.Forms.TextBox
$txtBackendIP.Location = New-Object System.Drawing.Point(230, 28)
$txtBackendIP.Size = New-Object System.Drawing.Size(300, 20)
$txtBackendIP.Text = $Global:Config.BackendIP
$grpConfig.Controls.Add($txtBackendIP)

# Porta do Backend
$lblBackendPort = New-Object System.Windows.Forms.Label
$lblBackendPort.Location = New-Object System.Drawing.Point(20, 60)
$lblBackendPort.Size = New-Object System.Drawing.Size(200, 20)
$lblBackendPort.Text = 'Porta do Backend:'
$grpConfig.Controls.Add($lblBackendPort)

$txtBackendPort = New-Object System.Windows.Forms.TextBox
$txtBackendPort.Location = New-Object System.Drawing.Point(230, 58)
$txtBackendPort.Size = New-Object System.Drawing.Size(100, 20)
$txtBackendPort.Text = $Global:Config.BackendPort
$grpConfig.Controls.Add($txtBackendPort)

# Porta do Frontend
$lblFrontendPort = New-Object System.Windows.Forms.Label
$lblFrontendPort.Location = New-Object System.Drawing.Point(20, 90)
$lblFrontendPort.Size = New-Object System.Drawing.Size(200, 20)
$lblFrontendPort.Text = 'Porta do Frontend:'
$grpConfig.Controls.Add($lblFrontendPort)

$txtFrontendPort = New-Object System.Windows.Forms.TextBox
$txtFrontendPort.Location = New-Object System.Drawing.Point(230, 88)
$txtFrontendPort.Size = New-Object System.Drawing.Size(100, 20)
$txtFrontendPort.Text = $Global:Config.FrontendPort
$grpConfig.Controls.Add($txtFrontendPort)

# Diretório PDFs
$lblPDFDir = New-Object System.Windows.Forms.Label
$lblPDFDir.Location = New-Object System.Drawing.Point(20, 120)
$lblPDFDir.Size = New-Object System.Drawing.Size(200, 20)
$lblPDFDir.Text = 'Pasta dos PDFs:'
$grpConfig.Controls.Add($lblPDFDir)

$txtPDFDir = New-Object System.Windows.Forms.TextBox
$txtPDFDir.Location = New-Object System.Drawing.Point(230, 118)
$txtPDFDir.Size = New-Object System.Drawing.Size(250, 20)
$txtPDFDir.Text = $Global:Config.PDFDirectory
$grpConfig.Controls.Add($txtPDFDir)

$btnBrowsePDF = New-Object System.Windows.Forms.Button
$btnBrowsePDF.Location = New-Object System.Drawing.Point(490, 116)
$btnBrowsePDF.Size = New-Object System.Drawing.Size(40, 24)
$btnBrowsePDF.Text = '...'
$btnBrowsePDF.Add_Click({
    $folderBrowser = New-Object System.Windows.Forms.FolderBrowserDialog
    $folderBrowser.Description = "Selecione a pasta onde estão os PDFs"
    if ($folderBrowser.ShowDialog() -eq 'OK') {
        $txtPDFDir.Text = $folderBrowser.SelectedPath
    }
})
$grpConfig.Controls.Add($btnBrowsePDF)

# Database URL
$lblDBURL = New-Object System.Windows.Forms.Label
$lblDBURL.Location = New-Object System.Drawing.Point(20, 150)
$lblDBURL.Size = New-Object System.Drawing.Size(200, 20)
$lblDBURL.Text = 'PostgreSQL URL:'
$grpConfig.Controls.Add($lblDBURL)

$txtDBURL = New-Object System.Windows.Forms.TextBox
$txtDBURL.Location = New-Object System.Drawing.Point(230, 148)
$txtDBURL.Size = New-Object System.Drawing.Size(300, 20)
$txtDBURL.Text = $Global:Config.DatabaseURL
$grpConfig.Controls.Add($txtDBURL)

# Checkbox - Criar atalhos
$chkShortcuts = New-Object System.Windows.Forms.CheckBox
$chkShortcuts.Location = New-Object System.Drawing.Point(20, 190)
$chkShortcuts.Size = New-Object System.Drawing.Size(300, 20)
$chkShortcuts.Text = 'Criar atalhos no Desktop'
$chkShortcuts.Checked = $true
$grpConfig.Controls.Add($chkShortcuts)

# Checkbox - Iniciar automaticamente
$chkAutoStart = New-Object System.Windows.Forms.CheckBox
$chkAutoStart.Location = New-Object System.Drawing.Point(20, 215)
$chkAutoStart.Size = New-Object System.Drawing.Size(300, 20)
$chkAutoStart.Text = 'Iniciar serviços automaticamente'
$chkAutoStart.Checked = $true
$grpConfig.Controls.Add($chkAutoStart)

# Barra de progresso
$progressBar = New-Object System.Windows.Forms.ProgressBar
$progressBar.Location = New-Object System.Drawing.Point(20, 380)
$progressBar.Size = New-Object System.Drawing.Size(560, 20)
$progressBar.Style = 'Continuous'
$form.Controls.Add($progressBar)

# Label de status
$lblStatus = New-Object System.Windows.Forms.Label
$lblStatus.Location = New-Object System.Drawing.Point(20, 405)
$lblStatus.Size = New-Object System.Drawing.Size(560, 20)
$lblStatus.Text = 'Pronto para instalar'
$lblStatus.TextAlign = 'MiddleCenter'
$form.Controls.Add($lblStatus)

# Botão Instalar
$btnInstall = New-Object System.Windows.Forms.Button
$btnInstall.Location = New-Object System.Drawing.Point(380, 430)
$btnInstall.Size = New-Object System.Drawing.Size(100, 30)
$btnInstall.Text = 'Instalar'
$btnInstall.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
$btnInstall.BackColor = [System.Drawing.Color]::FromArgb(0, 120, 215)
$btnInstall.ForeColor = [System.Drawing.Color]::White
$btnInstall.FlatStyle = 'Flat'
$btnInstall.Add_Click({
    $btnInstall.Enabled = $false
    $btnCancel.Enabled = $false
    Install-Siberius
})
$form.Controls.Add($btnInstall)

# Botão Cancelar
$btnCancel = New-Object System.Windows.Forms.Button
$btnCancel.Location = New-Object System.Drawing.Point(490, 430)
$btnCancel.Size = New-Object System.Drawing.Size(90, 30)
$btnCancel.Text = 'Cancelar'
$btnCancel.Add_Click({ $form.Close() })
$form.Controls.Add($btnCancel)

# Função de instalação
function Install-Siberius {
    $lblStatus.Text = "Configurando backend..."
    $progressBar.Value = 10
    Start-Sleep -Milliseconds 500
    
    # Atualizar config do backend
    $backendPath = Join-Path $PSScriptRoot "backend"
    $envContent = @"
API_PORT=$($txtBackendPort.Text)
NODE_ENV=production
DATABASE_URL="$($txtDBURL.Text)"
JWT_SECRET=siberius-secret-$(Get-Random -Maximum 999999)
JWT_EXPIRES_IN=12h
PDF_DIRECTORY=$($txtPDFDir.Text)
CHECK_INTERVAL_MINUTES=10
VERBOSE_LOGGING=true
"@
    $envContent | Out-File -FilePath "$backendPath\.env" -Encoding UTF8
    $progressBar.Value = 30
    
    $lblStatus.Text = "Configurando frontend..."
    Start-Sleep -Milliseconds 500
    
    # Atualizar config do frontend
    $frontendPath = Join-Path $PSScriptRoot "frontend\dist"
    $configContent = @"
window.SIBERIUS_CONFIG = {
  API_URL: 'http://$($txtBackendIP.Text):$($txtBackendPort.Text)',
  API_TIMEOUT: 10000,
  DEBUG: false
};
"@
    $configContent | Out-File -FilePath "$frontendPath\config.js" -Encoding UTF8
    $progressBar.Value = 50
    
    if ($chkShortcuts.Checked) {
        $lblStatus.Text = "Criando atalhos..."
        Start-Sleep -Milliseconds 500
        
        $desktop = [Environment]::GetFolderPath("Desktop")
        $shortcut = (New-Object -ComObject WScript.Shell).CreateShortcut("$desktop\Siberius.lnk")
        $shortcut.TargetPath = "http://$($txtBackendIP.Text):$($txtFrontendPort.Text)"
        $shortcut.Save()
        $progressBar.Value = 70
    }
    
    if ($chkAutoStart.Checked) {
        $lblStatus.Text = "Iniciando serviços..."
        Start-Sleep -Milliseconds 500
        
        # Aqui você adicionaria comandos para iniciar com PM2 ou como serviço
        $progressBar.Value = 90
    }
    
    $lblStatus.Text = "Instalação concluída!"
    $progressBar.Value = 100
    
    [System.Windows.Forms.MessageBox]::Show(
        "Siberius instalado com sucesso!`n`nAcesse: http://$($txtBackendIP.Text):$($txtFrontendPort.Text)",
        "Instalação Concluída",
        [System.Windows.Forms.MessageBoxButtons]::OK,
        [System.Windows.Forms.MessageBoxIcon]::Information
    )
    
    $form.Close()
}

# Mostrar formulário
[void]$form.ShowDialog()
