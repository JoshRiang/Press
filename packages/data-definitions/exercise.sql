CREATE TABLE IF NOT EXISTS exercises (
  exercise_id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS exercise_muscle_targets (
  exercise_id VARCHAR(64) NOT NULL,
  muscle_id VARCHAR(64) NOT NULL,
  target_type TEXT NOT NULL,
  PRIMARY KEY (exercise_id, muscle_id),
  FOREIGN KEY (exercise_id) REFERENCES exercises(exercise_id) ON DELETE CASCADE,
  FOREIGN KEY (muscle_id) REFERENCES muscles(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS tmp_exercise_data;

CREATE TEMP TABLE tmp_exercise_data (
  exercise_id TEXT,
  name TEXT,
  exercise_muscle_targets JSON
);

INSERT INTO tmp_exercise_data (exercise_id, name, exercise_muscle_targets) VALUES
('barbell_bench_press', 'Barbell Bench Press (Flat)', '{"primary_targets":["chest_mid"],"secondary_targets":["triceps","shoulders"]}'),
('incline_dumbbell_press', 'Incline Dumbbell Press', '{"primary_targets":["chest_up"],"secondary_targets":["shoulders","triceps"]}'),
('decline_barbell_press', 'Decline Barbell Press', '{"primary_targets":["chest_bot"],"secondary_targets":["triceps","chest_mid"]}'),
('pushups', 'Push-ups (Standard)', '{"primary_targets":["chest_mid"],"secondary_targets":["triceps","shoulders","core"]}'),
('chest_dips', 'Dips (Chest Focus)', '{"primary_targets":["chest_bot"],"secondary_targets":["triceps","shoulders"]}'),
('pullups', 'Pull-ups (Overhand Grip)', '{"primary_targets":["lats"],"secondary_targets":["biceps","back_mid","back"]}'),
('lat_pulldown', 'Lat Pulldown (Wide Grip)', '{"primary_targets":["lats"],"secondary_targets":["biceps","back_mid"]}'),
('barbell_row', 'Barbell Bent-over Row', '{"primary_targets":["back_mid"],"secondary_targets":["lats","biceps","back"]}'),
('seated_cable_row', 'Seated Cable Row', '{"primary_targets":["back_mid"],"secondary_targets":["lats","biceps","traps"]}'),
('conventional_deadlift', 'Conventional Deadlift', '{"primary_targets":["back","hamstring","glutes"],"secondary_targets":["quads","traps","forearm","core"]}'),
('military_press', 'Overhead Press (Military Press)', '{"primary_targets":["shoulders"],"secondary_targets":["triceps","chest_up","traps"]}'),
('lateral_raise', 'Dumbbell Lateral Raise', '{"primary_targets":["shoulders"],"secondary_targets":["traps"]}'),
('rear_delt_fly', 'Bent-over Dumbbell Rear Delt Fly', '{"primary_targets":["shoulders"],"secondary_targets":["traps","back_mid"]}'),
('face_pulls', 'Cable Face Pulls', '{"primary_targets":["shoulders","traps"],"secondary_targets":["back_mid"]}'),
('barbell_shrugs', 'Barbell Shrugs', '{"primary_targets":["traps"],"secondary_targets":["forearm","back"]}'),
('barbell_curl', 'Barbell Bicep Curl', '{"primary_targets":["biceps"],"secondary_targets":["forearm"]}'),
('dumbbell_hammer_curl', 'Dumbbell Hammer Curl', '{"primary_targets":["biceps","forearm"],"secondary_targets":[]}'),
('triceps_pushdown', 'Triceps Cable Pushdown', '{"primary_targets":["triceps"],"secondary_targets":[]}'),
('skullcrushers', 'Skullcrushers (EZ Bar Extensions)', '{"primary_targets":["triceps"],"secondary_targets":[]}'),
('close_grip_bench_press', 'Close Grip Bench Press', '{"primary_targets":["triceps"],"secondary_targets":["chest_mid","shoulders"]}'),
('barbell_squat', 'Barbell Squat (High Bar)', '{"primary_targets":["quads"],"secondary_targets":["glutes","hamstring","back","core"]}'),
('leg_press', 'Leg Press', '{"primary_targets":["quads"],"secondary_targets":["glutes","hamstring"]}'),
('romanian_deadlift', 'Romanian Deadlift (RDL)', '{"primary_targets":["hamstring","glutes"],"secondary_targets":["back","forearm"]}'),
('leg_extension', 'Leg Extension (Machine)', '{"primary_targets":["quads"],"secondary_targets":[]}'),
('standing_calf_raise', 'Standing Calf Raise', '{"primary_targets":["calves"],"secondary_targets":[]}'),
('hip_thrust', 'Barbell Hip Thrust', '{"primary_targets":["glutes"],"secondary_targets":["hamstring"]}'),
('crunch', 'Abdominal Crunch', '{"primary_targets":["core"],"secondary_targets":[]}'),
('plank', 'Plank (Standard)', '{"primary_targets":["core"],"secondary_targets":["shoulders","quads","back"]}'),
('hanging_leg_raise', 'Hanging Leg Raise', '{"primary_targets":["core"],"secondary_targets":["forearm"]}'),
('dumbbell_wrist_curl', 'Dumbbell Wrist Curl', '{"primary_targets":["forearm"],"secondary_targets":[]}'),
('dumbbell_flys_flat', 'Dumbbell Flys (Flat Bench)', '{"primary_targets":["chest_mid"],"secondary_targets":["shoulders"]}'),
('incline_dumbbell_flys', 'Incline Dumbbell Flys', '{"primary_targets":["chest_up"],"secondary_targets":["shoulders"]}'),
('cable_crossover_low_to_high', 'Cable Crossover (Low to High)', '{"primary_targets":["chest_up"],"secondary_targets":["shoulders","biceps"]}'),
('pec_deck_machine', 'Pec Deck Machine', '{"primary_targets":["chest_mid"],"secondary_targets":["shoulders"]}'),
('machine_chest_press_flat', 'Machine Chest Press (Flat)', '{"primary_targets":["chest_mid"],"secondary_targets":["triceps","shoulders"]}'),
('arnold_press', 'Arnold Press (Dumbbell)', '{"primary_targets":["shoulders"],"secondary_targets":["triceps","traps"]}'),
('seated_dumbbell_press', 'Seated Dumbbell Overhead Press', '{"primary_targets":["shoulders"],"secondary_targets":["triceps","traps"]}'),
('front_dumbbell_raise', 'Front Dumbbell Raise', '{"primary_targets":["shoulders"],"secondary_targets":["chest_up","traps"]}'),
('upright_row', 'Barbell Upright Row', '{"primary_targets":["traps","shoulders"],"secondary_targets":["biceps","forearm"]}'),
('t_bar_row', 'T-Bar Row (Supported)', '{"primary_targets":["back_mid"],"secondary_targets":["lats","biceps","back"]}'),
('dumbbell_pullover', 'Dumbbell Pullover', '{"primary_targets":["lats","chest_bot"],"secondary_targets":["triceps","chest_mid"]}'),
('rack_pulls', 'Rack Pulls (Above Knee)', '{"primary_targets":["back","traps"],"secondary_targets":["glutes","hamstring","forearm"]}'),
('good_mornings', 'Barbell Good Mornings', '{"primary_targets":["hamstring","back"],"secondary_targets":["glutes","core"]}'),
('preacher_curl', 'EZ Bar Preacher Curl', '{"primary_targets":["biceps"],"secondary_targets":["forearm"]}'),
('cable_curl_standing', 'Standing Cable Curl', '{"primary_targets":["biceps"],"secondary_targets":["forearm"]}'),
('concentration_curl', 'Dumbbell Concentration Curl', '{"primary_targets":["biceps"],"secondary_targets":[]}'),
('triceps_dips_machine', 'Machine Triceps Dips', '{"primary_targets":["triceps"],"secondary_targets":["shoulders","chest_bot"]}'),
('overhead_dumbbell_extension', 'Seated Overhead Dumbbell Extension (One Dumbbell)', '{"primary_targets":["triceps"],"secondary_targets":["shoulders"]}'),
('rope_triceps_pushdown', 'Rope Triceps Pushdown', '{"primary_targets":["triceps"],"secondary_targets":[]}'),
('bulgarian_split_squat', 'Bulgarian Split Squat (Dumbbell)', '{"primary_targets":["quads","glutes"],"secondary_targets":["hamstring","core"]}'),
('walking_lunges_dumbbell', 'Walking Lunges (Dumbbell)', '{"primary_targets":["quads","glutes"],"secondary_targets":["hamstring","core"]}'),
('goblet_squat', 'Goblet Squat (Dumbbell/Kettlebell)', '{"primary_targets":["quads"],"secondary_targets":["glutes","hamstring","core","shoulders"]}'),
('hack_squat_machine', 'Hack Squat Machine', '{"primary_targets":["quads"],"secondary_targets":["glutes","hamstring"]}'),
('seated_leg_curl', 'Seated Leg Curl (Machine)', '{"primary_targets":["hamstring"],"secondary_targets":["calves"]}'),
('sumo_deadlift', 'Sumo Deadlift', '{"primary_targets":["glutes","quads"],"secondary_targets":["hamstring","back","forearm","core"]}'),
('dumbbell_side_bend', 'Dumbbell Side Bend', '{"primary_targets":["core"],"secondary_targets":["back"]}'),
('russian_twist', 'Russian Twist (Weight Disk)', '{"primary_targets":["core"],"secondary_targets":["back"]}'),
('leg_raises_flat_bench', 'Flat Bench Leg Raises', '{"primary_targets":["core"],"secondary_targets":[]}'),
('cable_crunch', 'Kneeling Cable Crunch', '{"primary_targets":["core"],"secondary_targets":[]}'),
('farmers_walk', 'Farmer''s Walk', '{"primary_targets":["forearm","traps","core"],"secondary_targets":["shoulders","back","quads","calves"]}'),
('machine_shoulder_press', 'Machine Overhead Press (Seated)', '{"primary_targets":["shoulders"],"secondary_targets":["triceps","traps"]}'),
('dumbbell_shrugs_seated', 'Seated Dumbbell Shrugs', '{"primary_targets":["traps"],"secondary_targets":["forearm"]}'),
('face_pulls_rope', 'Rope Face Pulls (High Cable)', '{"primary_targets":["shoulders","traps"],"secondary_targets":["back_mid"]}'),
('single_arm_dumbbell_row', 'Single Arm Dumbbell Row (Benchy)', '{"primary_targets":["back_mid"],"secondary_targets":["lats","biceps","back"]}'),
('t_bar_row_machine', 'T-Bar Row Machine (Chest Supported)', '{"primary_targets":["back_mid"],"secondary_targets":["lats","biceps","traps"]}'),
('straight_arm_pulldown_rope', 'Straight Arm Cable Pulldown (Rope)', '{"primary_targets":["lats"],"secondary_targets":["triceps","back"]}'),
('hyperextension_back', 'Back Hyperextension (45 Degree)', '{"primary_targets":["back"],"secondary_targets":["glutes","hamstring"]}'),
('cable_curls_bilateral', 'Bilateral Cable Curls (Straight Bar)', '{"primary_targets":["biceps"],"secondary_targets":["forearm"]}'),
('incline_dumbbell_curl', 'Incline Dumbbell Curl', '{"primary_targets":["biceps"],"secondary_targets":["forearm"]}'),
('spider_curl_dumbbell', 'Spider Curl (Dumbbell)', '{"primary_targets":["biceps"],"secondary_targets":[]}'),
('ez_bar_skullcrushers', 'EZ Bar Skullcrushers', '{"primary_targets":["triceps"],"secondary_targets":["shoulders"]}'),
('single_arm_cable_triceps_extension', 'Single Arm Cable Overhead Triceps Extension', '{"primary_targets":["triceps"],"secondary_targets":[]}'),
('dumbbell_kickbacks', 'Dumbbell Triceps Kickbacks', '{"primary_targets":["triceps"],"secondary_targets":[]}'),
('smith_machine_squat', 'Smith Machine Squat', '{"primary_targets":["quads"],"secondary_targets":["glutes","hamstring","back"]}'),
('reverse_lunges_dumbbell', 'Reverse Lunges (Dumbbell)', '{"primary_targets":["quads","glutes"],"secondary_targets":["hamstring","core"]}'),
('pendulum_squat_machine', 'Pendulum Squat Machine', '{"primary_targets":["quads"],"secondary_targets":["glutes","hamstring"]}'),
('lying_leg_curl_machine', 'Lying Leg Curl Machine', '{"primary_targets":["hamstring"],"secondary_targets":["calves"]}'),
('seated_calf_raise_machine', 'Seated Calf Raise Machine', '{"primary_targets":["calves"],"secondary_targets":[]}'),
('glute_ham_developer', 'Glute-Ham Developer (GHD) Raise', '{"primary_targets":["hamstring","glutes"],"secondary_targets":["back"]}'),
('cable_pull_through', 'Cable Pull-Through', '{"primary_targets":["glutes","hamstring"],"secondary_targets":["back"]}'),
('ab_wheel_rollout', 'Ab Wheel Rollout', '{"primary_targets":["core"],"secondary_targets":["shoulders","back"]}'),
('reverse_crunch', 'Reverse Crunch (Flat Bench)', '{"primary_targets":["core"],"secondary_targets":[]}'),
('farmers_carry_heavy', 'Heavy Farmer''s Carry (Trap Bar)', '{"primary_targets":["forearm","traps","core"],"secondary_targets":["shoulders","back","quads"]}'),
('grip_crusher', 'Grip Crusher (Hand Gripper)', '{"primary_targets":["forearm"],"secondary_targets":[]}'),
('cable_flys_middle', 'Cable Flys (Middle Pulley)', '{"primary_targets":["chest_mid"],"secondary_targets":["shoulders"]}'),
('decline_dumbbell_press_machine', 'Machine Decline Chest Press', '{"primary_targets":["chest_bot"],"secondary_targets":["triceps","shoulders"]}'),
('upright_row_cable', 'Cable Upright Row', '{"primary_targets":["traps","shoulders"],"secondary_targets":["biceps","forearm"]}'),
('chest_supported_dumbbell_row', 'Chest Supported Dumbbell Row (Incline)', '{"primary_targets":["back_mid"],"secondary_targets":["lats","biceps","traps"]}'),
('v_bar_pulldown', 'V-Bar Lat Pulldown', '{"primary_targets":["lats","back_mid"],"secondary_targets":["biceps"]}'),
('stiff_leg_deadlift_smith', 'Smith Machine Stiff Leg Deadlift', '{"primary_targets":["hamstring","back"],"secondary_targets":["glutes","forearm"]}'),
('single_leg_press', 'Single Leg Press', '{"primary_targets":["quads"],"secondary_targets":["glutes","hamstring"]}'),
('jump_squat_bodyweight', 'Bodyweight Jump Squat', '{"primary_targets":["quads"],"secondary_targets":["glutes","hamstring","calves","core"]}'),
('dumbbell_hip_thrust_unilateral', 'Unilateral Dumbbell Hip Thrust', '{"primary_targets":["glutes"],"secondary_targets":["hamstring","core"]}'),
('side_plank', 'Side Plank', '{"primary_targets":["core"],"secondary_targets":["shoulders","back"]}'),
('bicycle_crunch', 'Bicycle Crunch', '{"primary_targets":["core"],"secondary_targets":[]}'),
('plate_pinch_carry', 'Plate Pinch Carry', '{"primary_targets":["forearm"],"secondary_targets":["core","traps"]}'),
('barbell_pullover', 'Barbell Pullover', '{"primary_targets":["lats","chest_bot"],"secondary_targets":["triceps","chest_mid"]}'),
('chest_press_machine_incline', 'Machine Incline Chest Press', '{"primary_targets":["chest_up"],"secondary_targets":["triceps","shoulders"]}'),
('machine_lateral_raise', 'Machine Lateral Raise', '{"primary_targets":["shoulders"],"secondary_targets":["traps"]}'),
('trap_bar_shrugs', 'Trap Bar Shrugs', '{"primary_targets":["traps"],"secondary_targets":["forearm","back"]}');

INSERT INTO exercises (exercise_id, name)
SELECT exercise_id, name
FROM tmp_exercise_data
ON CONFLICT (exercise_id) DO NOTHING;

INSERT INTO exercise_muscle_targets (exercise_id, muscle_id, target_type)
SELECT
  e.exercise_id,
  x.muscle_id,
  x.target_type
FROM tmp_exercise_data e
CROSS JOIN LATERAL (
  SELECT json_array_elements_text((e.exercise_muscle_targets::json)->'primary_targets') AS muscle_id, 'primary'::text AS target_type
  UNION ALL
  SELECT json_array_elements_text((e.exercise_muscle_targets::json)->'secondary_targets') AS muscle_id, 'secondary'::text AS target_type
) x
ON CONFLICT (exercise_id, muscle_id) DO NOTHING;

DROP TABLE IF EXISTS tmp_exercise_data;