using System.Collections.Generic;
using UnityEngine;

namespace BlackRoad.Worldbuilder.Identity
{
    /// <summary>
    /// Keeps track of all WorldIdentity components currently active in the scene.
    /// Provides lookup and lists for Archive/UI.
    /// </summary>
    public class WorldIdentityRegistry : MonoBehaviour
    {
        public static WorldIdentityRegistry Instance { get; private set; }

        private readonly List<WorldIdentity> _identities = new List<WorldIdentity>();

        public IReadOnlyList<WorldIdentity> Identities => _identities;

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

        public void Register(WorldIdentity identity)
        {
            if (identity != null && !_identities.Contains(identity))
            {
                _identities.Add(identity);
            }
        }

        public void Unregister(WorldIdentity identity)
        {
            if (identity != null)
            {
                _identities.Remove(identity);
            }
        }

        public IEnumerable<WorldIdentity> GetByType(WorldIdentity.EntityType type)
        {
            foreach (var id in _identities)
            {
                if (id != null && id.Type == type)
                    yield return id;
            }
        }
    }
}
