using UnityEngine;

namespace BlackRoad.Worldbuilder.Core
{
    /// <summary>
    /// Central singleton that owns the <see cref="GameState"/> machine,
    /// coordinates pause/resume, and wires keyboard shortcuts for save/load.
    ///
    /// Usage:
    ///   GameManager.Instance.SetState(GameState.Paused);
    ///   GameManager.Instance.SetState(GameState.Playing);
    /// </summary>
    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance { get; private set; }

        [Header("Building")]
        public Building.BlockDatabase blockDatabase;
        public Building.BlockPlacer blockPlacer;

        [Header("Input")]
        public Input.FlyCameraController flyCamera;

        [Header("Settings")]
        public bool showGridGizmos = true;

        [Header("Pause Menu")]
        [SerializeField] private GameObject pauseMenuRoot;

        [Header("Keys")]
        [SerializeField] private KeyCode pauseKey = KeyCode.Escape;

        /// <summary>Current game state. Subscribe to <see cref="OnStateChanged"/> for changes.</summary>
        public GameState CurrentState { get; private set; } = GameState.MainMenu;

        /// <summary>Fired whenever the state transitions. Args: (previous, next).</summary>
        public event System.Action<GameState, GameState> OnStateChanged;

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
            // Begin in Playing state by default; Main-menu scenes override this.
            SetState(GameState.Playing);
        }

        private void Update()
        {
            if (UnityEngine.Input.GetKeyDown(pauseKey))
            {
                if (CurrentState == GameState.Playing)
                    SetState(GameState.Paused);
                else if (CurrentState == GameState.Paused)
                    SetState(GameState.Playing);
            }
        }

        /// <summary>
        /// Transitions to <paramref name="next"/> and applies the side-effects
        /// (time scale, cursor, camera/placer enable).
        /// </summary>
        public void SetState(GameState next)
        {
            GameState previous = CurrentState;
            if (previous == next) return;

            CurrentState = next;
            ApplyState(next);
            OnStateChanged?.Invoke(previous, next);
        }

        private void ApplyState(GameState state)
        {
            // Note: Unity's Update() runs every frame regardless of Time.timeScale,
            // so Input.GetKeyDown in Update() correctly handles unpausing even at scale 0.
            switch (state)
            {
                case GameState.Playing:
                    Time.timeScale = 1f;
                    Cursor.lockState = CursorLockMode.Locked;
                    Cursor.visible = false;
                    if (flyCamera != null) flyCamera.enabled = true;
                    if (blockPlacer != null) blockPlacer.enabled = true;
                    if (pauseMenuRoot != null) pauseMenuRoot.SetActive(false);
                    break;

                case GameState.Paused:
                    Time.timeScale = 0f;
                    Cursor.lockState = CursorLockMode.None;
                    Cursor.visible = true;
                    if (flyCamera != null) flyCamera.enabled = false;
                    if (blockPlacer != null) blockPlacer.enabled = false;
                    if (pauseMenuRoot != null) pauseMenuRoot.SetActive(true);
                    break;

                case GameState.MainMenu:
                    Time.timeScale = 0f;
                    Cursor.lockState = CursorLockMode.None;
                    Cursor.visible = true;
                    if (flyCamera != null) flyCamera.enabled = false;
                    if (blockPlacer != null) blockPlacer.enabled = false;
                    if (pauseMenuRoot != null) pauseMenuRoot.SetActive(false);
                    break;
            }
        }
    }
}
