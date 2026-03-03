using System;
using System.Collections.Generic;
using System.Text;
using UnityEngine;
using UnityEngine.UI;

namespace BlackRoad.Worldbuilder.Desktop
{
    /// <summary>
    /// Interactive command-line terminal window for the BlackRoad desktop OS.
    /// Wire up an InputField for command entry, a Text element for output,
    /// and optionally a ScrollRect so the output scrolls to the latest line.
    ///
    /// Usage: Attach to the root Panel of a terminal DesktopWindow alongside
    /// DesktopWindow.cs.  Assign the three UI references in the Inspector.
    /// </summary>
    public class TerminalWindowController : MonoBehaviour
    {
        [Header("UI References")]
        [SerializeField] private InputField commandInput;
        [SerializeField] private Text outputText;
        [SerializeField] private ScrollRect outputScrollRect;

        [Header("Settings")]
        [SerializeField] private string prompt = "> ";
        [SerializeField] private int maxOutputLines = 200;

        private readonly StringBuilder _output = new StringBuilder();
        private readonly List<string> _history = new List<string>();
        private int _historyIndex = -1;

        private void OnEnable()
        {
            Print("BlackRoad OS Terminal  [type 'help' for commands]");
            PrintPrompt();
            FocusInput();
        }

        private void Awake()
        {
            if (commandInput != null)
            {
                commandInput.onEndEdit.AddListener(OnSubmitCommand);
            }
        }

        private void Update()
        {
            if (commandInput == null || !commandInput.isFocused) return;

            // History navigation
            if (Input.GetKeyDown(KeyCode.UpArrow) && _history.Count > 0)
            {
                _historyIndex = Mathf.Clamp(_historyIndex + 1, 0, _history.Count - 1);
                SetInputText(_history[_historyIndex]);
            }
            else if (Input.GetKeyDown(KeyCode.DownArrow))
            {
                _historyIndex--;
                if (_historyIndex < 0)
                {
                    _historyIndex = -1;
                    SetInputText(string.Empty);
                }
                else
                {
                    SetInputText(_history[_historyIndex]);
                }
            }
        }

        // ------------------------------------------------------------------ //
        //  Command submission                                                  //
        // ------------------------------------------------------------------ //

        private void OnSubmitCommand(string raw)
        {
            // onEndEdit fires on both Enter and loss of focus — only act on Enter
            if (!Input.GetKeyDown(KeyCode.Return) && !Input.GetKeyDown(KeyCode.KeypadEnter))
                return;

            string cmd = raw.Trim();
            commandInput.text = string.Empty;

            PrintLine($"{prompt}{cmd}");

            if (!string.IsNullOrEmpty(cmd))
            {
                _history.Insert(0, cmd);
                _historyIndex = -1;
                ExecuteCommand(cmd);
            }

            PrintPrompt();
            FocusInput();
            ScrollToBottom();
        }

        private void ExecuteCommand(string cmd)
        {
            string[] parts = cmd.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
            string verb = parts[0].ToLowerInvariant();

            switch (verb)
            {
                case "help":
                    PrintHelp();
                    break;

                case "clear":
                case "cls":
                    _output.Clear();
                    RefreshOutputText();
                    break;

                case "echo":
                    Print(cmd.Length > verb.Length ? cmd.Substring(verb.Length + 1) : string.Empty);
                    break;

                case "version":
                    Print($"BlackRoad OS  v{Application.version}  ({Application.platform})");
                    break;

                case "quit":
                case "exit":
                    DesktopManager.Instance?.ShowDesktop(false);
                    break;

                default:
                    Print($"Unknown command: '{verb}'.  Type 'help' for a list.");
                    break;
            }
        }

        // ------------------------------------------------------------------ //
        //  Built-in commands                                                   //
        // ------------------------------------------------------------------ //

        private void PrintHelp()
        {
            Print("Available commands:");
            Print("  help       — show this message");
            Print("  clear      — clear terminal output");
            Print("  echo <msg> — print a message");
            Print("  version    — show application version");
            Print("  exit       — close the desktop");
        }

        // ------------------------------------------------------------------ //
        //  Output helpers                                                      //
        // ------------------------------------------------------------------ //

        /// <summary>Print a line followed by a newline.</summary>
        public void Print(string text)
        {
            PrintLine(text);
            ScrollToBottom();
        }

        private void PrintLine(string text)
        {
            _output.AppendLine(text);
            TrimOutput();
            RefreshOutputText();
        }

        private void PrintPrompt()
        {
            // Prompt is shown in the InputField placeholder; nothing extra needed
        }

        private void TrimOutput()
        {
            var raw = _output.ToString();
            var lines = raw.Split('\n');
            if (lines.Length <= maxOutputLines) return;

            int start = lines.Length - maxOutputLines;
            _output.Clear();
            for (int i = start; i < lines.Length; i++)
            {
                if (!string.IsNullOrEmpty(lines[i]))
                    _output.AppendLine(lines[i]);
            }
        }

        private void RefreshOutputText()
        {
            if (outputText != null)
                outputText.text = _output.ToString();
        }

        private void ScrollToBottom()
        {
            if (outputScrollRect != null)
            {
                Canvas.ForceUpdateCanvases();
                outputScrollRect.verticalNormalizedPosition = 0f;
            }
        }

        private void FocusInput()
        {
            if (commandInput != null)
            {
                commandInput.ActivateInputField();
                commandInput.Select();
            }
        }

        private void SetInputText(string text)
        {
            if (commandInput == null) return;
            commandInput.text = text;
            commandInput.caretPosition = text.Length;
        }
    }
}
