namespace BlackRoad.Worldbuilder.Core
{
    /// <summary>
    /// Represents the high-level state of the game loop.
    /// </summary>
    public enum GameState
    {
        /// <summary>The main menu scene is active.</summary>
        MainMenu,

        /// <summary>The player is actively building/exploring the world.</summary>
        Playing,

        /// <summary>The game is paused; camera and building are frozen.</summary>
        Paused,
    }
}
