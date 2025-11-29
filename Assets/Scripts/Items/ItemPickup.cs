using UnityEngine;
using BlackRoad.Worldbuilder.Interaction;

#if UNITY_EDITOR
using UnityEditor;
#endif

namespace BlackRoad.Worldbuilder.Items
{
    /// <summary>
    /// World object that can be picked up as an item and added to the player's inventory.
    /// </summary>
    public class ItemPickup : Interactable
    {
        [Header("Item")]
        [SerializeField] private ItemDefinition item;
        [SerializeField] private int amount = 1;

        public override void Interact(GameObject interactor)
        {
            if (item == null) return;

            var inventory = interactor.GetComponent<Inventory>();
            if (inventory == null)
            {
                Debug.LogWarning("[ItemPickup] Interactor has no Inventory.");
                return;
            }

            int added = inventory.AddItem(item, amount);
            if (added > 0)
            {
                // Could play sound, VFX, etc. For now, just destroy.
                Destroy(gameObject);
            }
        }

#if UNITY_EDITOR
        private void OnValidate()
        {
            // Set display name/verb for Interactable UI
            if (item != null)
            {
                var so = new SerializedObject(this);
                so.FindProperty("displayName").stringValue = item.DisplayName;
                so.FindProperty("verb").stringValue = "Pick up";
                so.ApplyModifiedPropertiesWithoutUndo();
            }
        }
#endif
    }
}
