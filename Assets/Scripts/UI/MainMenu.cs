// Example usage:
//   1. Create a new Unity scene called "MainMenu".
//   2. Add a Canvas with three Buttons: "New World", "Load World", "Quit".
//   3. Add MainMenu to the Canvas (or any root GameObject).
//   4. Assign the three Button references in the Inspector.
//   5. Set the playScene and the saveSlot name in the Inspector.

using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;

namespace BlackRoad.Worldbuilder.UI
{
    /// <summary>
    /// Drives the main-menu screen.
    /// Provides buttons for New World, Load World (if a save exists), and Quit.
    /// </summary>
    public class MainMenu : MonoBehaviour
    {
        [Header("Buttons")]
        [SerializeField] private Button newWorldButton;
        [SerializeField] private Button loadWorldButton;
        [SerializeField] private Button quitButton;

        [Header("Scene")]
        [Tooltip("Name of the scene to load when starting or loading a world.")]
        [SerializeField] private string playScene = "World";

        [Header("Save")]
        [Tooltip("Slot name whose existence gates the Load World button.")]
        [SerializeField] private string saveSlot = "slot1";
        [SerializeField] private string saveFolderName = "WorldSaves";

        private void Awake()
        {
            if (newWorldButton != null)
                newWorldButton.onClick.AddListener(OnNewWorld);

            if (loadWorldButton != null)
                loadWorldButton.onClick.AddListener(OnLoadWorld);

            if (quitButton != null)
                quitButton.onClick.AddListener(OnQuit);
        }

        private void Start()
        {
            // Enable/disable Load World based on save file existence.
            if (loadWorldButton != null)
                loadWorldButton.interactable = SaveExists();
        }

        // ─────────────────────────────────────────────────────────────────────

        private void OnNewWorld()
        {
            // Clear any existing save flag so WorldSerializer starts fresh.
            PlayerPrefs.SetInt("LoadOnStart", 0);
            PlayerPrefs.Save();
            SceneManager.LoadScene(playScene);
        }

        private void OnLoadWorld()
        {
            if (!SaveExists()) return;

            // Signal WorldSerializer to auto-load once the play scene initialises.
            PlayerPrefs.SetInt("LoadOnStart", 1);
            PlayerPrefs.SetString("LoadSlot", saveSlot);
            PlayerPrefs.Save();
            SceneManager.LoadScene(playScene);
        }

        private void OnQuit()
        {
#if UNITY_EDITOR
            UnityEditor.EditorApplication.isPlaying = false;
#else
            Application.Quit();
#endif
        }

        // ─────────────────────────────────────────────────────────────────────

        private bool SaveExists()
        {
            string path = System.IO.Path.Combine(
                Application.persistentDataPath,
                saveFolderName,
                $"{saveSlot}.json"
            );
            return System.IO.File.Exists(path);
        }
    }
}
