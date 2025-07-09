using System;
using System.Drawing;
using System.Windows.Forms;

public class MainForm : Form
{
    ListBox lstPlayers = new();
    TextBox txtLog = new() { Multiline = true, ReadOnly = true, ScrollBars = ScrollBars.Vertical };
    TextBox txtCommand = new();
    Button btnSend = new() { Text = "Send" };
    Button btnStart = new() { Text = "Start Server" };
    PropertyGrid grid = new();

    bool running = false;

    public MainForm()
    {
        Text = "VoidTogether Server";
        Width = 800;
        Height = 600;

        grid.SelectedObject = Program.Config.properties;
        grid.Dock = DockStyle.Left;
        grid.Width = 250;

        lstPlayers.Dock = DockStyle.Right;
        lstPlayers.Width = 200;

        txtLog.Dock = DockStyle.Fill;

        Panel bottom = new() { Dock = DockStyle.Bottom, Height = 30 };
        txtCommand.Dock = DockStyle.Fill;
        btnSend.Dock = DockStyle.Right;
        btnStart.Dock = DockStyle.Left;
        bottom.Controls.Add(btnStart);
        bottom.Controls.Add(txtCommand);
        bottom.Controls.Add(btnSend);

        Controls.Add(txtLog);
        Controls.Add(grid);
        Controls.Add(lstPlayers);
        Controls.Add(bottom);

        btnStart.Click += (s, e) =>
        {
            if (!running)
            {
                Program.StartServer(Log, RefreshPlayers);
                running = true;
                btnStart.Text = "Stop Server";
            }
            else
            {
                Program.StopServer();
                running = false;
                btnStart.Text = "Start Server";
                RefreshPlayers();
            }
        };

        btnSend.Click += (s, e) =>
        {
            Program.ExecuteCommand(txtCommand.Text, Log);
            txtCommand.Clear();
        };
    }

    void Log(string text)
    {
        if (txtLog.InvokeRequired)
        {
            txtLog.Invoke(new Action<string>(Log), text);
            return;
        }
        txtLog.AppendText(text + Environment.NewLine);
    }

    void RefreshPlayers()
    {
        if (lstPlayers.InvokeRequired)
        {
            lstPlayers.Invoke(new Action(RefreshPlayers));
            return;
        }
        lstPlayers.Items.Clear();
        foreach (var p in Program.Players)
            lstPlayers.Items.Add(p.Username);
    }
}
