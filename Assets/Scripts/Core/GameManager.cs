using UnityEngine;

namespace BlackRoad.Worldbuilder.Core
{
    /// <summary>
    /// Singleton manager handling game state transitions, pause/resume, and input.
    /// Press ESC to toggle pause, manages Time.timeScale and cursor lock state.
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

        [Header("UI References")]
        [SerializeField] private UI.PauseMenuUI pauseMenuUI;
        [SerializeField] private UI.MainMenuUI mainMenuUI;

        [Header("State")]
        [SerializeField] private GameState currentState = GameState.Playing;

        /// <summary>
        /// Current game state
        /// </summary>
        public GameState CurrentState => currentState;

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
            // Initialize based on starting state
            SetState(currentState);
        }

        private void Update()
        {
            // ESC key toggles pause when playing
            if (UnityEngine.Input.GetKeyDown(KeyCode.Escape))
            {
                if (currentState == GameState.Playing)
                {
                    Pause();
                }
                else if (currentState == GameState.Paused)
                {
                    Resume();
                }
            }
        }

        /// <summary>
        /// Set the current game state and handle transitions
        /// </summary>
        public void SetState(GameState newState)
        {
            if (currentState == newState)
                return;

            currentState = newState;

            switch (currentState)
            {
                case GameState.MainMenu:
                    Time.timeScale = 0f;
                    Cursor.lockState = CursorLockMode.None;
                    Cursor.visible = true;
                    DisableGameplayControls();
                    if (mainMenuUI != null) mainMenuUI.Show();
                    if (pauseMenuUI != null) pauseMenuUI.Hide();
                    break;

                case GameState.Playing:
                    Time.timeScale = 1f;
                    Cursor.lockState = CursorLockMode.Locked;
                    Cursor.visible = false;
                    EnableGameplayControls();
                    if (mainMenuUI != null) mainMenuUI.Hide();
                    if (pauseMenuUI != null) pauseMenuUI.Hide();
                    break;

                case GameState.Paused:
                    Time.timeScale = 0f;
                    Cursor.lockState = CursorLockMode.None;
                    Cursor.visible = true;
                    DisableGameplayControls();
                    if (pauseMenuUI != null) pauseMenuUI.Show();
                    break;
            }
        }

        /// <summary>
        /// Pause the game (switch to Paused state)
        /// </summary>
        public void Pause()
        {
            SetState(GameState.Paused);
        }

        /// <summary>
        /// Resume the game (switch to Playing state)
        /// </summary>
        public void Resume()
        {
            SetState(GameState.Playing);
        }

        /// <summary>
        /// Return to main menu
        /// </summary>
        public void ReturnToMainMenu()
        {
            SetState(GameState.MainMenu);
        }

        /// <summary>
        /// Start new game from main menu
        /// </summary>
        public void StartNewGame()
        {
            SetState(GameState.Playing);
        }

        private void EnableGameplayControls()
        {
            if (flyCamera != null) flyCamera.enabled = true;
            if (playerController != null) playerController.enabled = true;
            if (blockPlacer != null) blockPlacer.enabled = true;
        }

        private void DisableGameplayControls()
        {
            if (flyCamera != null) flyCamera.enabled = false;
            if (playerController != null) playerController.enabled = false;
            if (blockPlacer != null) blockPlacer.enabled = false;
        }
    }
}
