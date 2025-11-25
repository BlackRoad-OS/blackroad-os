using System.Collections;
using UnityEngine;
using BlackRoad.Worldbuilder.Environment;

namespace BlackRoad.Worldbuilder.Villagers
{
    /// <summary>
    /// Simple villager behaviour:
    /// - Sleep at home during sleep window.
    /// - Go to work location during work hours.
    /// - Wander around village during wander window.
    /// Uses DayNightCycle.timeOfDay as clock.
    /// </summary>
    [RequireComponent(typeof(CharacterController))]
    public class VillagerAgent : MonoBehaviour
    {
        public enum VillagerState
        {
            Sleeping,
            GoingHome,
            AtHome,
            GoingToWork,
            AtWork,
            Wandering
        }

        [Header("Schedule")]
        [SerializeField] private VillagerSchedule schedule;
        [SerializeField] private DayNightCycle dayNight;

        [Header("Locations")]
        [SerializeField] private Transform homeAnchor;
        [SerializeField] private Transform workAnchor;
        [SerializeField] private float arriveDistance = 1.5f;

        [Header("Movement")]
        [SerializeField] private float walkSpeed = 2.5f;
        [SerializeField] private float turnSpeed = 6f;
        [SerializeField] private float gravity = 9.81f;
        [SerializeField] private float wanderRadius = 8f;
        [SerializeField] private LayerMask groundMask = ~0;

        public VillagerState State { get; private set; }
        public VillagerSchedule Schedule { get => schedule; set => schedule = value; }
        public DayNightCycle DayNight { get => dayNight; set => dayNight = value; }
        public Transform HomeAnchor { get => homeAnchor; set => homeAnchor = value; }
        public Transform WorkAnchor { get => workAnchor; set => workAnchor = value; }

        private CharacterController _controller;
        private Vector3 _velocity;
        private Vector3 _wanderCenter;
        private Vector3 _wanderTarget;
        private Coroutine _logicRoutine;

        private void Awake()
        {
            _controller = GetComponent<CharacterController>();
        }

        private void Start()
        {
            if (dayNight == null)
                dayNight = FindObjectOfType<DayNightCycle>();

            // Default wander center = home
            _wanderCenter = homeAnchor != null ? homeAnchor.position : transform.position;

            _logicRoutine = StartCoroutine(StateLoop());
        }

        private IEnumerator StateLoop()
        {
            while (true)
            {
                float t = GetTimeOfDay();

                if (schedule != null && schedule.IsSleepTime(t))
                {
                    yield return SleepRoutine();
                }
                else if (schedule != null && schedule.IsWorkTime(t) && workAnchor != null)
                {
                    // work time
                    yield return WorkRoutine();
                }
                else if (schedule != null && schedule.IsWanderTime(t))
                {
                    // wander near home
                    yield return WanderRoutine();
                }
                else
                {
                    // default = "at home" (idle)
                    yield return AtHomeRoutine();
                }

                yield return null;
            }
        }

        private float GetTimeOfDay()
        {
            if (dayNight != null)
                return dayNight.timeOfDay;
            return 0.5f; // midday default
        }

        private IEnumerator SleepRoutine()
        {
            State = VillagerState.Sleeping;

            // Move to home if far away
            if (homeAnchor != null)
            {
                yield return MoveTo(homeAnchor.position, VillagerState.GoingHome);
            }

            // Then sleep: minimal movement, maybe tiny idle
            while (schedule != null && schedule.IsSleepTime(GetTimeOfDay()))
            {
                // shrink velocity
                _velocity = Vector3.zero;

                // subtle breathing bob
                float bob = Mathf.Sin(Time.time * 0.5f) * 0.02f;
                var pos = transform.position;
                pos.y += bob;
                transform.position = pos;

                yield return null;
            }
        }

        private IEnumerator WorkRoutine()
        {
            State = VillagerState.GoingToWork;

            if (workAnchor != null)
            {
                yield return MoveTo(workAnchor.position, VillagerState.GoingToWork);
            }

            State = VillagerState.AtWork;

            while (schedule != null && schedule.IsWorkTime(GetTimeOfDay()))
            {
                // You could add simple pacing, animation, etc. Here we just idle.
                _velocity = new Vector3(0f, _velocity.y, 0f);
                yield return null;
            }
        }

        private IEnumerator WanderRoutine()
        {
            State = VillagerState.Wandering;

            _wanderCenter = homeAnchor != null ? homeAnchor.position : transform.position;

            float endTime = Time.time + 60f; // don't wander forever in case schedule changes

            while (Time.time < endTime && schedule != null && schedule.IsWanderTime(GetTimeOfDay()))
            {
                if ((_wanderTarget - transform.position).sqrMagnitude < 1f)
                {
                    // Pick a new wander target
                    if (!TryGetWanderPoint(out _wanderTarget))
                    {
                        yield return null;
                        continue;
                    }
                }

                yield return MoveStepTowards(_wanderTarget, walkSpeed);
                yield return null;
            }
        }

        private IEnumerator AtHomeRoutine()
        {
            State = VillagerState.AtHome;

            if (homeAnchor != null)
            {
                yield return MoveTo(homeAnchor.position, VillagerState.GoingHome);
            }

            float timer = 0f;
            while (schedule != null && !schedule.IsSleepTime(GetTimeOfDay()) &&
                   !schedule.IsWorkTime(GetTimeOfDay()) &&
                   !schedule.IsWanderTime(GetTimeOfDay()))
            {
                timer += Time.deltaTime;
                _velocity = new Vector3(0f, _velocity.y, 0f);

                yield return null;
            }
        }

        private IEnumerator MoveTo(Vector3 target, VillagerState movingState)
        {
            State = movingState;

            while (true)
            {
                Vector3 flatPos = new Vector3(transform.position.x, 0f, transform.position.z);
                Vector3 flatTarget = new Vector3(target.x, 0f, target.z);
                Vector3 toTarget = flatTarget - flatPos;
                float dist = toTarget.magnitude;
                if (dist <= arriveDistance)
                    yield break;

                Vector3 dir = toTarget.normalized;
                if (dir.sqrMagnitude > 0.0001f)
                {
                    Quaternion targetRot = Quaternion.LookRotation(dir, Vector3.up);
                    transform.rotation = Quaternion.Slerp(
                        transform.rotation,
                        targetRot,
                        turnSpeed * Time.deltaTime);
                }

                Vector3 move = transform.forward * walkSpeed;
                _velocity.x = move.x;
                _velocity.z = move.z;

                yield return null;
            }
        }

        private IEnumerator MoveStepTowards(Vector3 target, float speed)
        {
            Vector3 flatPos = new Vector3(transform.position.x, 0f, transform.position.z);
            Vector3 flatTarget = new Vector3(target.x, 0f, target.z);
            Vector3 toTarget = flatTarget - flatPos;
            float dist = toTarget.magnitude;
            if (dist < 0.5f) yield break;

            Vector3 dir = toTarget.normalized;
            if (dir.sqrMagnitude > 0.0001f)
            {
                Quaternion targetRot = Quaternion.LookRotation(dir, Vector3.up);
                transform.rotation = Quaternion.Slerp(
                    transform.rotation,
                    targetRot,
                    turnSpeed * Time.deltaTime);
            }

            Vector3 move = transform.forward * speed;
            _velocity.x = move.x;
            _velocity.z = move.z;

            yield return null;
        }

        private bool TryGetWanderPoint(out Vector3 result)
        {
            for (int i = 0; i < 8; i++)
            {
                float angle = Random.Range(0f, Mathf.PI * 2f);
                float dist = Random.Range(1f, wanderRadius);

                Vector3 candidate = _wanderCenter +
                                    new Vector3(Mathf.Cos(angle), 0f, Mathf.Sin(angle)) * dist;

                // Sample ground via raycast
                if (Physics.Raycast(candidate + Vector3.up * 30f, Vector3.down,
                        out RaycastHit hit, 100f, groundMask))
                {
                    result = hit.point;
                    return true;
                }
            }

            result = _wanderCenter;
            return false;
        }

        private void Update()
        {
            // Apply gravity
            if (_controller.isGrounded)
                _velocity.y = -1f;
            else
                _velocity.y -= gravity * Time.deltaTime;

            _controller.Move(_velocity * Time.deltaTime);
        }
    }
}
