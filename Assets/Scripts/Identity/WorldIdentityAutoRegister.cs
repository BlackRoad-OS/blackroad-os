using UnityEngine;

namespace BlackRoad.Worldbuilder.Identity
{
    /// <summary>
    /// Helper that automatically registers a WorldIdentity with the registry.
    /// </summary>
    [RequireComponent(typeof(WorldIdentity))]
    public class WorldIdentityAutoRegister : MonoBehaviour
    {
        private WorldIdentity _identity;

        private void Awake()
        {
            _identity = GetComponent<WorldIdentity>();
        }

        private void OnEnable()
        {
            WorldIdentityRegistry.Instance?.Register(_identity);
        }

        private void OnDisable()
        {
            WorldIdentityRegistry.Instance?.Unregister(_identity);
        }
    }
}
