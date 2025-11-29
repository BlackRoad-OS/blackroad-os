using UnityEngine;

namespace BlackRoad.Worldbuilder.Desktop
{
    /// <summary>
    /// Controls the in-world "desktop": toggling visibility, focusing windows, etc.
    /// For now it's mostly a container that can show/hide the entire OS.
    /// </summary>
    public class DesktopManager : MonoBehaviour
    {
        public static DesktopManager Instance { get; private set; }

        [Header("Desktop Root")]
        [SerializeField] private GameObject desktopRoot;

        [Header("Windows")]
        [SerializeField] private DesktopWindow[] windows;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }

            Instance = this;
            DontDestroyOnLoad(gameObject);

            if (desktopRoot != null)
                desktopRoot.SetActive(false);
        }

        public void ToggleDesktop()
        {
            if (desktopRoot == null) return;

            bool newState = !desktopRoot.activeSelf;
            desktopRoot.SetActive(newState);

            if (newState)
            {
                BringAnyWindowToFront();
            }
        }

        public void ShowDesktop(bool visible)
        {
            if (desktopRoot == null) return;
            desktopRoot.SetActive(visible);

            if (visible)
            {
                BringAnyWindowToFront();
            }
        }

        private void BringAnyWindowToFront()
        {
            if (windows == null || windows.Length == 0) return;

            foreach (var w in windows)
            {
                if (w != null && w.gameObject.activeSelf)
                {
                    w.transform.SetAsLastSibling();
                    return;
                }
            }
        }
    }
}
