using UnityEngine;
using BlackRoad.Worldbuilder.Building;

namespace BlackRoad.Worldbuilder.World
{
    /// <summary>
    /// Types of physics behaviors for blocks.
    /// </summary>
    public enum PhysicsType
    {
        None,
        Falling,
        Flowing,
        Interactive
    }

    /// <summary>
    /// Base class for blocks with physics behavior.
    /// Provides common functionality for updating physics over time.
    /// </summary>
    public class PhysicsBlock : MonoBehaviour
    {
        [Header("Physics Settings")]
        [SerializeField] protected PhysicsType _physicsType = PhysicsType.None;
        [SerializeField] protected float _updateInterval = 0.5f;

        protected WorldGrid _worldGrid;
        protected Vector3Int _gridPosition;
        protected float _lastUpdateTime;

        /// <summary>
        /// Gets the physics type of this block.
        /// </summary>
        public PhysicsType PhysicsType => _physicsType;

        protected virtual void Awake()
        {
            // Find WorldGrid in scene
            _worldGrid = FindObjectOfType<WorldGrid>();
            
            if (_worldGrid != null)
            {
                _gridPosition = _worldGrid.WorldToGrid(transform.position);
            }
        }

        protected virtual void Start()
        {
            _lastUpdateTime = Time.time;
        }

        protected virtual void Update()
        {
            // Check if it's time to update physics
            if (Time.time - _lastUpdateTime >= _updateInterval)
            {
                _lastUpdateTime = Time.time;
                UpdatePhysics();
            }
        }

        /// <summary>
        /// Override this method to implement custom physics behavior.
        /// Called at regular intervals based on updateInterval.
        /// </summary>
        protected virtual void UpdatePhysics()
        {
            // Base implementation does nothing
        }

        /// <summary>
        /// Updates the grid position based on current world position.
        /// </summary>
        protected void UpdateGridPosition()
        {
            if (_worldGrid != null)
            {
                _gridPosition = _worldGrid.WorldToGrid(transform.position);
            }
        }

        /// <summary>
        /// Checks if there's a block at the given grid position.
        /// </summary>
        /// <param name="position">Grid position to check</param>
        /// <returns>True if a block exists at the position</returns>
        protected bool HasBlockAt(Vector3Int position)
        {
            if (_worldGrid == null)
                return false;

            return _worldGrid.TryGetBlock(position, out GameObject block) && block != null;
        }
    }
}
