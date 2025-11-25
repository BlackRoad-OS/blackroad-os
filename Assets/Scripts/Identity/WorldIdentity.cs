using UnityEngine;

namespace BlackRoad.Worldbuilder.Identity
{
    /// <summary>
    /// Assigns a stable identity to an entity in the world.
    /// Used by the registry and archive to track critters, villagers, etc.
    /// </summary>
    public class WorldIdentity : MonoBehaviour
    {
        public enum EntityType
        {
            Unknown,
            Critter,
            Villager,
            Structure,
            Landmark,
            Player
        }

        [Header("Identity")]
        [SerializeField] private string uniqueId;
        [SerializeField] private string displayName = "Entity";
        [SerializeField] private EntityType type = EntityType.Unknown;

        public string UniqueId => uniqueId;
        public string DisplayName => displayName;
        public EntityType Type => type;

#if UNITY_EDITOR
        private void OnValidate()
        {
            // If no ID assigned, generate a pseudo GUID once in editor
            if (string.IsNullOrEmpty(uniqueId))
            {
                uniqueId = System.Guid.NewGuid().ToString("N");
            }

            if (string.IsNullOrEmpty(displayName))
            {
                displayName = gameObject.name;
            }
        }
#endif
    }
}
