using UnityEngine;
using UnityEngine.UI;

namespace BlackRoad.Worldbuilder.UI
{
    /// <summary>
    /// Pause menu UI with Resume, Save, Load, and Main Menu buttons.
    /// Controlled by GameManager when pressing ESC during gameplay.
    /// </summary>
    public class PauseMenuUI : MonoBehaviour
    {
        [Header("UI Elements")]
        [SerializeField] private Button resumeButton;
        [SerializeField] private Button saveButton;
        [SerializeField] private Button loadButton;
        [SerializeField] private Button mainMenuButton;

        [Header("References")]
        [SerializeField] private Core.WorldSerializer worldSerializer;

        private void Start()
        {
            // Wire up button events
            if (resumeButton != null)
                resumeButton.onClick.AddListener(OnResume);

            if (saveButton != null)
                saveButton.onClick.AddListener(OnSave);

            if (loadButton != null)
                loadButton.onClick.AddListener(OnLoad);

            if (mainMenuButton != null)
                mainMenuButton.onClick.AddListener(OnMainMenu);

            if (worldSerializer == null)
                worldSerializer = FindObjectOfType<Core.WorldSerializer>();

            // Start hidden
            Hide();
        }

        /// <summary>
        /// Resume the game
        /// </summary>
        private void OnResume()
        {
            if (Core.GameManager.Instance != null)
            {
                Core.GameManager.Instance.Resume();
            }
        }

        /// <summary>
        /// Save the current world
        /// </summary>
        private void OnSave()
        {
            if (worldSerializer != null)
            {
                worldSerializer.Save("slot1");
                Debug.Log("[PauseMenuUI] World saved!");
            }
            else
            {
                Debug.LogWarning("[PauseMenuUI] No WorldSerializer found.");
            }
        }

        /// <summary>
        /// Load a saved world
        /// </summary>
        private void OnLoad()
        {
            if (worldSerializer != null)
            {
                worldSerializer.Load("slot1");
                Debug.Log("[PauseMenuUI] World loaded!");
                
                // Resume after loading
                if (Core.GameManager.Instance != null)
                {
                    Core.GameManager.Instance.Resume();
                }
            }
            else
            {
                Debug.LogWarning("[PauseMenuUI] No WorldSerializer found.");
            }
        }

        /// <summary>
        /// Return to main menu
        /// </summary>
        private void OnMainMenu()
        {
            if (Core.GameManager.Instance != null)
            {
                Core.GameManager.Instance.ReturnToMainMenu();
            }
        }

        /// <summary>
        /// Show the pause menu
        /// </summary>
        public void Show()
        {
            gameObject.SetActive(true);
        }

        /// <summary>
        /// Hide the pause menu
        /// </summary>
        public void Hide()
        {
            gameObject.SetActive(false);
        }
    }
}
