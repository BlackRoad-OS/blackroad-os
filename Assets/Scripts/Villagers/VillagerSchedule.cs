using UnityEngine;

namespace BlackRoad.Worldbuilder.Villagers
{
    /// <summary>
    /// Represents a simple daily schedule for a villager.
    /// Times are normalized [0..1] over one simulated day (0 = 0:00, 0.5 = 12:00).
    /// </summary>
    [CreateAssetMenu(
        fileName = "VillagerSchedule",
        menuName = "BlackRoad/Worldbuilder/VillagerSchedule",
        order = 0)]
    public class VillagerSchedule : ScriptableObject
    {
        [Header("Home / Sleep")]
        [Range(0f, 1f)] public float sleepStart = 0.80f;   // 19:12
        [Range(0f, 1f)] public float sleepEnd   = 0.20f;   // 04:48

        [Header("Work")]
        [Range(0f, 1f)] public float workStart  = 0.30f;   // ~7:12
        [Range(0f, 1f)] public float workEnd    = 0.65f;   // ~15:36

        [Header("Wander")]
        [Range(0f, 1f)] public float wanderStart = 0.20f;
        [Range(0f, 1f)] public float wanderEnd   = 0.30f;

        public bool IsSleepTime(float t)
        {
            if (sleepStart < sleepEnd)
                return t >= sleepStart && t <= sleepEnd;
            return t >= sleepStart || t <= sleepEnd;
        }

        public bool IsWorkTime(float t)
        {
            return t >= workStart && t <= workEnd;
        }

        public bool IsWanderTime(float t)
        {
            return t >= wanderStart && t <= wanderEnd;
        }
    }
}
