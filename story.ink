VAR health = 100
VAR stamina = 100
VAR hunger = 0
VAR day = 1
VAR hour = 6            # 6 = morning
VAR location = "Clearing"
VAR sponsor_points = 0
VAR sponsor_given = false

=== function timeofday ===
{hour >= 18: "Evening" | hour >= 12: "Afternoon" | "Morning"}
=== end ===

=== function tick (hrs) ===
~ hour += hrs
{hour >= 24:
    ~ hour -= 24
    ~ day += 1
-|}
=== end ===

=== function search_water ===
You move cautiously, scanning for water sources.
{ location == "Lake":
    You are already at the lake. The cool water glistens.
    ~ stamina -= 5
- else:
    After half an hour of trekking you find a small stream.
    ~ location = "Stream"
    ~ stamina -= 15
    ~ hunger += 5
    ~ sponsor_points += 1
}
~ tick(1)
-> free_roam
=== end ===

=== function rest ===
You find a shaded spot and rest.
~ stamina = min(stamina+25,100)
~ hunger += 10
~ tick(2)
-> free_roam
=== end ===

=== function unknown (cmd) ===
You attempt to "{cmd}" but nothing notable happens.
~ tick(0.5)
-> free_roam
=== end ===

=== function receive_sponsor ===
~ health = min(health+40,100)
~ stamina = min(stamina+40,100)
~ sponsor_given = true
=== end ===


=== start ===
You step onto the arena clearing as the Games begin.
-> free_roam

=== free_roam ===
~ hunger += 5
{hunger >= 100:
    Starvation overtakes you. A cannon echoes.
    -> death
-|}

{health <= 0:
    -> death
-|}

You are at a {location}. What will you do?
{hour = hour}  # dummy to force var refresh
-> END

=== death ===
Darkness closes in. The audience gasps as your cannon fires.
-> END
