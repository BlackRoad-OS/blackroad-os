using UnityEngine;
using BlackRoad.Worldbuilder.Interaction;

namespace BlackRoad.Worldbuilder.Desktop
{
    /// <summary>
    /// In-world terminal object that toggles the DesktopManager OS UI when used.
    /// Attach to a console mesh with a collider.
    /// </summary>
    public class InWorldTerminal : Interactable
    {
        private void Awake()
        {
#if UNITY_EDITOR
            var so = new UnityEditor.SerializedObject(this);
            so.FindProperty("displayName").stringValue = "BlackRoad Console";
            so.FindProperty("verb").stringValue = "Open";
            so.ApplyModifiedPropertiesWithoutUndo();
#endif
        }

        public override void Interact(GameObject interactor)
        {
            if (DesktopManager.Instance != null)
            {
                DesktopManager.Instance.ToggleDesktop();
            }
        }
    }
}
