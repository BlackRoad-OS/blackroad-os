using UnityEngine;

namespace BlackRoad.Worldbuilder.Core
{
    /// <summary>
    /// Central singleton that owns the <see cref="GameState"/> machine.
    /// Wires pause (Escape) and save/load shortcut feedback.
    /// Attach to a persistent GameObject in the first scene.
    /// </summary>
    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance { get; private set; }

        [Header("Building")]
        public Building.BlockDatabase blockDatabase;
        public Building.BlockPlacer blockPlacer;

        [Header("Input")]
        public Input.FlyCameraController flyCamera;
        public Player.PlayerController playerController;

        [Header("Settings")]
        public bool showGridGizmos = true;

        [Header("Pause UI")]
        [SerializeField] private GameObject pauseMenuRoot;

        // ── State ────────────────────────────────────────────────────────────

        /// <summary>Current high-level state of the game.</summary>
        public GameState CurrentState { get; private set; } = GameState.Playing;

        // ── Unity lifecycle ──────────────────────────────────────────────────

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }

            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        private void Start()
        {
            SetState(GameState.Playing);
        }

        private void Update()
        {
            if (UnityEngine.Input.GetKeyDown(KeyCode.Escape))
            {
                TogglePause();
            }
        }

        // ── State management ─────────────────────────────────────────────────

        /// <summary>
        /// Transitions the game to <paramref name="newState"/>,
        /// applying the appropriate side-effects (time scale, cursor, UI).
        /// </summary>
        public void SetState(GameState newState)
        {
            CurrentState = newState;

            switch (newState)
            {
                case GameState.Playing:
                    Time.timeScale = 1f;
                    SetInputEnabled(true);
                    SetPauseMenuVisible(false);
                    Cursor.lockState = CursorLockMode.Locked;
                    Cursor.visible = false;
                    break;

                case GameState.Paused:
                    Time.timeScale = 0f;
                    SetInputEnabled(false);
                    SetPauseMenuVisible(true);
                    Cursor.lockState = CursorLockMode.None;
                    Cursor.visible = true;
                    break;

                case GameState.MainMenu:
                    Time.timeScale = 1f;
                    SetInputEnabled(false);
                    SetPauseMenuVisible(false);
                    Cursor.lockState = CursorLockMode.None;
                    Cursor.visible = true;
                    break;
            }
        }

        /// <summary>Toggles between <see cref="GameState.Playing"/> and <see cref="GameState.Paused"/>.</summary>
        public void TogglePause()
        {
            SetState(CurrentState == GameState.Paused ? GameState.Playing : GameState.Paused);
        }

        // ── Helpers ───────────────────────────────────────────────────────────

        private void SetInputEnabled(bool enabled)
        {
            if (flyCamera != null)
                flyCamera.enabled = enabled;

            if (blockPlacer != null)
                blockPlacer.enabled = enabled;
        }

        private void SetPauseMenuVisible(bool visible)
        {
            if (pauseMenuRoot != null)
                pauseMenuRoot.SetActive(visible);
        }
    }
}
