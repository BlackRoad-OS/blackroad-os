using System.Collections;
using UnityEngine;
using BlackRoad.Worldbuilder.Building;

namespace BlackRoad.Worldbuilder.World
{
    /// <summary>
    /// Water block with flow simulation.
    /// Water spreads to adjacent empty spaces, prioritizing downward flow.
    /// </summary>
    public class WaterBlock : PhysicsBlock
    {
        [Header("Water Settings")]
        [SerializeField] private int _maxSpreadDistance = 7;
        [SerializeField] private float _spreadDelay = 1f;
        [SerializeField] private string _waterBlockID = "water";
        [SerializeField] private int _flowLevel = 0;

        private bool _isFlowing = false;

        protected override void Awake()
        {
            base.Awake();
            _physicsType = PhysicsType.Flowing;
        }

        protected override void UpdatePhysics()
        {
            base.UpdatePhysics();

            if (_isFlowing)
                return;

            // Start flowing coroutine
            StartCoroutine(FlowCoroutine());
        }

        /// <summary>
        /// Coroutine that handles water flow simulation.
        /// </summary>
        /// <returns>Coroutine enumerator</returns>
        private IEnumerator FlowCoroutine()
        {
            if (_worldGrid == null || _flowLevel >= _maxSpreadDistance)
            {
                yield break;
            }

            _isFlowing = true;

            yield return new WaitForSeconds(_spreadDelay);

            // Try to flow down first (priority)
            Vector3Int downPos = _gridPosition + Vector3Int.down;
            if (TrySpread(downPos))
            {
                _isFlowing = false;
                yield break;
            }

            // If can't flow down, spread horizontally
            Vector3Int[] horizontalDirections = new Vector3Int[]
            {
                Vector3Int.forward,
                Vector3Int.back,
                Vector3Int.left,
                Vector3Int.right
            };

            foreach (var direction in horizontalDirections)
            {
                Vector3Int targetPos = _gridPosition + direction;
                TrySpread(targetPos);
            }

            _isFlowing = false;
        }

        /// <summary>
        /// Attempts to spread water to an adjacent position.
        /// </summary>
        /// <param name="targetPos">Target grid position</param>
        /// <returns>True if water was successfully spread</returns>
        private bool TrySpread(Vector3Int targetPos)
        {
            if (_worldGrid == null)
                return false;

            // Check if position is empty
            if (HasBlockAt(targetPos))
                return false;

            // Get water block type
            BlockType waterType = null;
            var database = FindObjectOfType<BlockDatabase>();
            if (database != null)
            {
                waterType = database.Get(_waterBlockID);
            }

            if (waterType == null)
                return false;

            // Place water block
            GameObject newWater = _worldGrid.PlaceBlock(targetPos, waterType);
            
            if (newWater != null)
            {
                // Set flow level on new water block
                WaterBlock waterComponent = newWater.GetComponent<WaterBlock>();
                if (waterComponent != null)
                {
                    waterComponent.SetFlowLevel(_flowLevel + 1);
                }
                return true;
            }

            return false;
        }

        /// <summary>
        /// Sets the flow level of this water block.
        /// Used to track distance from source and limit spreading.
        /// </summary>
        /// <param name="level">Flow level (distance from source)</param>
        public void SetFlowLevel(int level)
        {
            _flowLevel = level;
        }

        /// <summary>
        /// Gets the current flow level.
        /// </summary>
        public int FlowLevel => _flowLevel;
    }
}
