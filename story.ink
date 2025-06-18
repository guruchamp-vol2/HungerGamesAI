VAR health = 100
VAR stamina = 100
VAR hunger  = 0
VAR sponsor_points = 0
VAR kills = 0
VAR tributes_remaining = 24
VAR idle = 0
VAR ally = false
VAR name = ""
VAR district = 0
VAR age = 0
VAR pack = ""          # what mentor put in your pack
VAR score = 5          # Gamemaker score (1-12)
VAR hour = 6
VAR day  = 0

LIST events = 
    "wolf_mutts",
    "night_frost",
    "fire_wall",
    "tracker_jackers",
    "snare_trap"

=== function timeofday ===
{hour >= 18:"Evening" | hour >= 12:"Afternoon" | "Morning"}
=== end ===

=== function tick(h) ===
~ hour += h
{ hour >= 24:
    ~ hour -= 24
    ~ day  += 1
-|}
=== end ===

################################################################
###   CHARACTER CREATION
################################################################
=== start ===
-> ask_name

=== ask_name ===
{ name == "":
    What is your name, tribute? 
    ~ name = prompt("Name:")
    -> ask_name
- else:
    -> ask_district
}

=== ask_district ===
Choose your district (1-12):

+ 1  -> {_district_choice(1)}
+ 2  -> {_district_choice(2)}
+ 3  -> {_district_choice(3)}
+ 4  -> {_district_choice(4)}
+ 5  -> {_district_choice(5)}
+ 6  -> {_district_choice(6)}
+ 7  -> {_district_choice(7)}
+ 8  -> {_district_choice(8)}
+ 9  -> {_district_choice(9)}
+ 10 -> {_district_choice(10)}
+ 11 -> {_district_choice(11)}
+ 12 -> {_district_choice(12)}

=== _district_choice(num) ===
~ district = num
-> ask_age

=== ask_age ===
How old are you, {name}? _(must be under 18)_
~ temp a = prompt("Age:")
~ a = to_int(a)
{ a >= 18:
    A Peacekeeper shakes his head. Too old.
    -> ask_age
- else:
    ~ age = a
    -> reaping
}

################################################################
###   REAPING & MENTOR BACKPACK CHOICE
################################################################
=== reaping ===
The square sways with suspense. Your name is drawn at the Reaping.

**Mentor meeting** – choose what goes into your launch backpack:

+ Medical kit & water  
    ~ pack = "medkit"
    ~ sponsor_points += 1
    Your mentor says: “Stay alive first.”
    -> training_1
+ Hunting knife & rope  
    ~ pack = "knife"
    ~ sponsor_points += 1
    Mentor: “Offense can be defense.”
    -> training_1
+ Extra rations & matches  
    ~ pack = "rations"
    ~ sponsor_points += 1
    Mentor: “Fire and food win hearts.”
    -> training_1

################################################################
###   10-DAY TRAINING (condensed version)
################################################################
=== training_1 ===
DAY 1 – Weapons.  
+ Bow practice      ~ stamina -=5  ~ sponsor_points +=2 -> training_2
+ Sword drills      ~ stamina -=8  ~ sponsor_points +=1 -> training_2
+ Observe others    ~ stamina +=4  ~ sponsor_points -=1 -> training_2

=== training_2 ===
DAY 2 – Survival.  
+ Purify water      ~ sponsor_points +=2  -> training_3
+ Snare traps       ~ sponsor_points +=1  -> training_3
+ Sneak extra food  ~ hunger -=10 ~ sponsor_points -=1 -> training_3

=== training_3 ===
DAY 3 – Camouflage.  
+ Forest patterns   ~ sponsor_points +=2 -> training_4
+ Silly face paint  ~ sponsor_points -=1 -> training_4

=== training_4 ===
DAY 4 – First aid.  
+ Study herb lore   ~ sponsor_points +=2 -> training_5
+ Ignore lesson     ~ sponsor_points -=1 -> training_5

=== training_5 ===
DAY 5 – Hand-to-hand.  
+ Defensive stance  ~ stamina -=4  ~ sponsor_points +=1 -> training_6
+ All-out offense   ~ stamina -=9  ~ sponsor_points +=2 -> training_6

=== training_6 ===
DAY 6 – Logic puzzle.  
+ Solve quickly     ~ sponsor_points +=2 -> training_7
+ Give up           ~ sponsor_points -=1 -> training_7

=== training_7 ===
DAY 7 – Climbing wall.  
+ Reach the top     ~ stamina -=6  ~ sponsor_points +=1 -> training_8
+ Skip              ~ sponsor_points -=1 -> training_8

=== training_8 ===
DAY 8 – Team drill.  
+ Help tributes     ~ sponsor_points +=2 -> training_9
+ Sabotage rival    ~ sponsor_points -=2 -> training_9

=== training_9 ===
DAY 9 – Arena trivia.  
+ Memorize hazards  ~ sponsor_points +=1 -> training_10
+ Daydream          ~ sponsor_points -=1 -> training_10

=== training_10 ===
DAY 10 – Private Gamemaker session.  
Choose a stunt:

+ Trick-shot arrow  
    ~ sponsor_points +=3
    ~ score = 10
    -> platform_countdown
+ Knife juggling    
    ~ sponsor_points +=2
    ~ score = 8
    -> platform_countdown
+ Refuse to perform 
    ~ sponsor_points -=3
    ~ score = 4
    -> platform_countdown

################################################################
###   60-SECOND PLATFORM CHOICE
################################################################
=== platform_countdown ===
Your platform rises. 60 seconds until the Games begin.

+ Wait for the horn (safe)  
    You steady your breath.
    -> cornucopia_choice
+ Step off early (death)  
    You leap—  
    The ground detonates. Instant death.  
    -> death

################################################################
###   CORNUCOPIA BLOODBATH
################################################################
=== cornucopia_choice ===
The horn blares!  
Do you dash for supplies or flee?

+ Loot the Cornucopia  
    Chaos erupts around you.  
    You grab a pack and a {pack}.  
    ~ sponsor_points += 1
    ~ stamina -= 10
    -> arena_loop
+ Flee to the woods  
    You sprint for cover, hearing screams behind you.  
    ~ stamina -= 5
    -> arena_loop

################################################################
###   MAIN ARENA LOOP (free roam)
################################################################
=== arena_loop ===
~ idle = 0
~ tick(0.2)
~ hunger += 5

{ health <= 0: -> death
| hunger >= 100: Starvation wins. -> death
| tributes_remaining == 1: -> victory
}

**Day {day}, {timeofday}.**  
Health {health} | Stamina {stamina} | Hunger {hunger} | Kills {kills} | Remaining {tributes_remaining}

{ ally == true: _An ally shadows your steps._ }

What will you do? (type command)

-> command_bridge

=== command_bridge ===
~ temp cmd = bridge_prompt()
{ cmd == "search water":   -> do_search_water
| cmd == "hide":           -> do_hide
| cmd == "attack":         -> do_attack
| cmd == "talk":           -> do_talk
| cmd == "rest":           -> do_rest
| else:                    -> do_nothing
}

=== do_search_water ===
You search for water…
~ stamina -= 10
You find a shallow stream and drink.
-> random_event

=== do_hide ===
You climb a tree and stay still.
~ idle = 0
-> random_event

=== do_attack ===
You ambush a tribute!
~ tributes_remaining -= 1
~ kills += 1
The cannon booms.
-> random_event

=== do_talk ===
{ ally == false:
    A nearby tribute hesitates… then agrees to ally.
    ~ ally = true
    ~ sponsor_points += 1
- else:
    Your ally whispers strategy.
}
-> random_event

=== do_rest ===
You rest beneath foliage.
~ stamina = min(stamina+20,100)
~ hunger += 5
-> random_event

=== do_nothing ===
"I… don’t understand that action."  
~ idle += 1
-> random_event


################################################################
###   RANDOM EVENT / IDLE DANGER
################################################################
=== random_event ===
{ idle >= 2:
    DANGER finds you!
    ~ temp e = RANDOM(events)
    { e == "wolf_mutts":      A wolf mutt lunges—claws rake your arm. ~ health -= 30
    | e == "night_frost":     Night frost chills you to the bone.      ~ stamina -= 20
    | e == "fire_wall":       A wall of fire forces a sprint.          ~ stamina -= 25
    | e == "tracker_jackers": Tracker-jackers sting you.               ~ health -= 20
    | e == "snare_trap":      A snare whips your leg.                  ~ health -= 15
    }
    ~ idle = 0
- else:
    The arena stays eerily quiet…
}

-> arena_loop

################################################################
###   WIN / LOSE
################################################################
=== victory ===
The final cannon echoes across the arena…  
You, {name} of District {district}, are the victor!  
Kills: {kills} | Sponsor points: {sponsor_points} | Final score: {score}
-> END

=== death ===
Darkness closes in; the anthem plays.  
A cannon fires for {name}.  
-> END
