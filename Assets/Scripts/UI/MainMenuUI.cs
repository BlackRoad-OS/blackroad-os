using UnityEngine;
using UnityEngine.UI;

namespace BlackRoad.Worldbuilder.UI
{
    /// <summary>
    /// Main menu UI with New World, Load World, and Quit buttons.
    /// Controls game state transitions via GameManager.
    /// </summary>
    public class MainMenuUI : MonoBehaviour
    {
        [Header("UI Elements")]
        [SerializeField] private Button newWorldButton;
        [SerializeField] private Button loadWorldButton;
        [SerializeField] private Button quitButton;

        [Header("References")]
        [SerializeField] private Core.WorldSerializer worldSerializer;

        private void Start()
        {
            // Wire up button events
            if (newWorldButton != null)
                newWorldButton.onClick.AddListener(OnNewWorld);

            if (loadWorldButton != null)
                loadWorldButton.onClick.AddListener(OnLoadWorld);

            if (quitButton != null)
                quitButton.onClick.AddListener(OnQuit);

            if (worldSerializer == null)
                worldSerializer = FindObjectOfType<Core.WorldSerializer>();
        }

        /// <summary>
        /// Start a new world - clears existing world and starts playing
        /// </summary>
        private void OnNewWorld()
        {
            Debug.Log("[MainMenuUI] Starting new world...");

            // Clear the world
            var worldGrid = FindObjectOfType<Building.WorldGrid>();
            if (worldGrid != null)
            {
                worldGrid.ClearAll();
            }

            // Start playing
            if (Core.GameManager.Instance != null)
            {
                Core.GameManager.Instance.StartNewGame();
            }
        }

        /// <summary>
        /// Load an existing world from save file
        /// </summary>
        private void OnLoadWorld()
        {
            Debug.Log("[MainMenuUI] Loading world...");

            if (worldSerializer != null)
            {
                worldSerializer.Load("slot1");
            }
            else
            {
                Debug.LogWarning("[MainMenuUI] No WorldSerializer found.");
            }

            // Start playing
            if (Core.GameManager.Instance != null)
            {
                Core.GameManager.Instance.StartNewGame();
            }
        }

        /// <summary>
        /// Quit the application
        /// </summary>
        private void OnQuit()
        {
            Debug.Log("[MainMenuUI] Quitting application...");

            #if UNITY_EDITOR
            UnityEditor.EditorApplication.isPlaying = false;
            #else
            Application.Quit();
            #endif
        }

        /// <summary>
        /// Show the main menu
        /// </summary>
        public void Show()
        {
            gameObject.SetActive(true);
        }

        /// <summary>
        /// Hide the main menu
        /// </summary>
        public void Hide()
        {
            gameObject.SetActive(false);
        }
    }
}
