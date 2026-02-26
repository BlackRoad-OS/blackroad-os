// Example usage:
//   1. Create a separate "MainMenu" scene.
//   2. Add a Canvas with three Buttons: "New World", "Load World", "Quit".
//   3. Add MainMenu to a GameObject in the scene.
//   4. Wire the three Button references in the Inspector.
//   5. Set newWorldScene and worldScene to the correct scene names in Build Settings.

using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;

namespace BlackRoad.Worldbuilder.UI
{
    /// <summary>
    /// Drives the main-menu scene with three actions:
    /// <list type="bullet">
    ///   <item><description>New World – loads the world scene fresh.</description></item>
    ///   <item><description>Load World – loads the world scene and triggers <c>WorldSerializer.Load()</c>.</description></item>
    ///   <item><description>Quit – exits the application.</description></item>
    /// </list>
    /// </summary>
    public class MainMenu : MonoBehaviour
    {
        [Header("Buttons")]
        [SerializeField] private Button newWorldButton;
        [SerializeField] private Button loadWorldButton;
        [SerializeField] private Button quitButton;

        [Header("Scene Names")]
        [Tooltip("Name of the main gameplay scene (must be in Build Settings).")]
        [SerializeField] private string worldScene = "World";

        [Header("Save Slot")]
        [Tooltip("Slot passed to WorldSerializer.Load() when pressing Load World.")]
        [SerializeField] private string loadSlot = "slot1";

        // Shared flag read by WorldSerializer on scene load
        internal static bool LoadOnStart { get; private set; } = false;
        internal static string LoadSlot { get; private set; } = "slot1";

        // ── Unity lifecycle ───────────────────────────────────────────────────

        private void Awake()
        {
            if (newWorldButton != null)
                newWorldButton.onClick.AddListener(OnNewWorld);

            if (loadWorldButton != null)
                loadWorldButton.onClick.AddListener(OnLoadWorld);

            if (quitButton != null)
                quitButton.onClick.AddListener(OnQuit);
        }

        // ── Button handlers ───────────────────────────────────────────────────

        /// <summary>Starts a fresh world without loading any save file.</summary>
        public void OnNewWorld()
        {
            LoadOnStart = false;
            SceneManager.LoadScene(worldScene);
        }

        /// <summary>Loads the world scene and signals <see cref="Core.WorldSerializer"/> to restore a save.</summary>
        public void OnLoadWorld()
        {
            LoadOnStart = true;
            LoadSlot = loadSlot;
            SceneManager.LoadScene(worldScene);
        }

        /// <summary>Exits the application (no-op in the editor).</summary>
        public void OnQuit()
        {
#if UNITY_EDITOR
            UnityEditor.EditorApplication.isPlaying = false;
#else
            Application.Quit();
#endif
        }
    }
}
