// Default AzzyAI config files embedded for the web GUI. H_Config.lua and M_Config.lua are the
// shipped preset and must stay identical to USER_AI/H_Config.lua and USER_AI/M_Config.lua in the
// parent repository (CI checks it), because a config created here starts from them.
// The tactics, PVP and Extra files only carry their defaults.
window.AzzyTemplates = {
  'H_Config.lua': String.raw`ServerType               = SERVER_OFFICIAL -- SERVER_PRIVATE for rAthena/Hercules servers
AggroHP                  = 0
AggroSP                  = 0
UseSkillOnly             = -1 
UseAttackSkill           = 1
OpportunisticTargeting   = 0
DoNotChase               = 0
UseDanceAttack           = 1
SuperPassive             = 0
UseIdleWalk              = 4
IdleWalkSP               = 80
UseCastleRoute           = 0
RelativeRoute            = 1
UseCastleDefend          = 0
CastleDefendThreshold    = 4
IdleWalkDistance         = 4
FleeHP                   = 0
UseDamageDanger          = 0
DamageDangerDrop         = 30
DamageDangerHP           = 60
RescueOwnerLowHP         = 0
LiveMobID                = 0

AttackSkillReserveSP     = 0 
AutoMobMode              = 2 
AutoMobCount             = 2
UseVanilCaprice          = 1
UseFilirMoon             = 1
UseVanilSelfDestruct     = 0
AutoSkillDelay           = 200
AoEMaximizeTargets       = 0
CastTimeRatio            = .80
UseDefensiveBuff         = 3
UseOffensiveBuff         = 3 
UseProvokeOwner          = 0
LifEscapeLevel           = 0
FilirFlitLevel           = 5
FilirAccelLevel          = 5
AmiBulwarkLevel          = 5
HealSelfHP               = 50 
HealOwnerHP              = 50 
UseAutoHeal              = 0 
FollowStayBack           = 2
StationaryAggroDist      = 12
MobileAggroDist          = 12
StationaryMoveBounds     = 14
MobileMoveBounds         = 14
DoNotUseRest             = 0
RestXOff                 = 2
RestYOff                 = 0	
MoveSticky               = 0
MoveStickyFight          = 0
KiteMonsters             = 0
KiteBounds               = 10 
KiteStep                 = 5
KiteParanoidStep         = 2
KiteThreshold            = 3
KiteParanoidThreshold    = 2
KiteParanoid             = 0 
DefendStandby            = 0 
StickyStandby            = 0 
SpawnDelay               = 1000
StandbyFriending         = 1  
MirAIFriending           = 1  
UseAvoid                 = 0  
TankMonsterLimit         = 4
AoEReserveSP             = 0

ChaseSPPause             = 0
ChaseSPPauseSP 			= -60
ChaseSPPauseTime         = 3000
AttackTimeLimit          = 10000

AssumeHomun              = 1
AttackLastFullSP         = 0
DanceMinSP               = 0
AutoSkillLimit           = 0
UseAutoPushback          = 0
AutoPushbackThreshold    = 2
AoEFixedLevel            = 0
ForceKite                = 0
UseBerserkMobbed         = 0
UseBerserkSkill          = 0
UseBerserkAttack         = 0
Berserk_SkillAlways      = 0
Berserk_Dance            = 0
Berserk_IgnoreMinSP      = 0
PVPmode                  = 0
DefensiveBuffOwnerMobbed = 0
LastSavedDate            = "Default Configuration LATAM"
LagReduction             = 0
DoNotAttackMoving        = 0
UseSmartBulwark          = 0

-- New Homunculus S Skills
-- the newer attacks are off here and enabled per homunculus in Types/<Name>.lua, where the AI uses

-- New OldHomun Defaults
AllowBloodlust             =0
AllowSBR44                 =0`,
  'M_Config.lua': String.raw`
ServerType               = SERVER_OFFICIAL -- SERVER_PRIVATE for rAthena/Hercules servers
AggroHP                  = 60
AggroSP                  = 0
UseSkillOnly             = -1 
UseAttackSkill           = 1
OpportunisticTargeting   = 0
DoNotChase               = 0
UseDanceAttack           = 0
SuperPassive             = 0
UseIdleWalk              = 0
IdleWalkSP               = 80
IdleWalkDistance         = 4
RelativeRoute            = 1
FleeHP                   = 0

-- Attack skill options
AttackSkillReserveSP     = 0 
AutoMobMode              = 2 
AutoMobCount             = 2
UseAutoPushback          = 0
AutoPushbackThreshold    = 2
AutoSkillDelay           = 400 
AoEMaximizeTargets       = 0
CastTimeRatio		= .80


--Autobuff options

UseDefensiveBuff         = 1
UseOffensiveBuff         = 1 
UseProvokeOwner          = 1
UseProvokeSelf		=0
UseSacrificeOwner        = 0
UseAutoMag               = 0
UseAutoSight             = 1
DefensiveBuffOwnerHP     = 0
UseBlessingOwner         = 1
UseBlessingSelf          = 0
UseIncAgiSelf            = 0
UseIncAgiOwner           = 1
UseKyrieSelf             = 0
UseKyrieOwner            = 0


FollowStayBack           = 2
StationaryAggroDist      = 12
MobileAggroDist          = 7
StationaryMoveBounds     = 14
MobileMoveBounds         = 14
DoNotUseRest             = 0
RestXOff                 = -2
RestYOff                 = 0	

MoveSticky               = 0
MoveStickyFight          = 0

--Kiting options:
KiteMonsters             = 0
KiteBounds               = 10 
KiteStep                 = 5
KiteParanoidStep         = 2
KiteThreshold            = 3
KiteParanoidThreshold    = 2
KiteParanoid             = 0 

--Standby Behavior:
DefendStandby            = 0 
StickyStandby            = 1 


--Advanced Timing settings 
SpawnDelay               = 1000
AutoSkillDelay           = 400
AttackTimeLimit          = 10000
--Berserk Settings:

UseBerserkMobbed         = 0 
UseBerserkSkill          = 0 
UseBerserkAttack         = 0 
Berserk_SkillAlways      = 0 
Berserk_Dance            = 0
Berserk_IgnoreMinSP      = 0 


--Misc settings:
StandbyFriending         = 1  
MirAIFriending           = 1  
TankMonsterLimit         = 4

AssumeHomun              = 1
AutoDetectPlant          = 1
RescueOwnerLowHP         = 0
AttackLastFullSP         = 0
AutoSkillLimit           = 0
AoEReserveSP             = 0
AoEFixedLevel            = 0
ChaseSPPause             = 0
ChaseSPPauseSP           = 0
ChaseSPPauseTime         = 0
DefensiveBuffOwnerMobbed = 0
ForceKite                = 0
UseBerserkMobbed         = 0
UseBerserkSkill          = 0
UseBerserkAttack         = 0
Berserk_SkillAlways      = 0
Berserk_Dance            = 0
Berserk_IgnoreMinSP      = 0
PVPmode                  = 0
LastSavedDate            = "Default Configuration 1.56"
LagReduction             = 0
LiveMobID                = 0
DoNotAttackMoving        = 0`,
  'H_Tactics.lua': String.raw`MyTact={}
MyTact[0]={TACT_ATTACK_M,SKILL_ALWAYS,KITE_NEVER,CAST_REACT,PUSH_SELF,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_NORMAL} --Default
MyTact[13]={TACT_REACT_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,0,CHASE_NORMAL} --Treasure Box
MyTact[1005]={TACT_ATTACK_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,0.5,CHASE_NORMAL} --Familiar
MyTact[1042]={TACT_ATTACK_L,-1,KITE_REACT,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_OLD,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_NORMAL} --Steel Chonchon
MyTact[1111]={TACT_SNIPE_M,SKILL_NEVER,KITE_ALWAYS,CAST_REACT,PUSH_SELF,DEBUFF_NEVER,CLASS_OLD,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_NORMAL} --Drainliar
MyTact[1153]={TACT_ATTACK_H,-3,KITE_ALWAYS,CAST_REACT,PUSH_SELF,DEBUFF_NEVER,CLASS_OLD,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_NORMAL} --Orc Zombie
MyTact[1152]={TACT_SNIPE_M,-3,KITE_ALWAYS,CAST_REACT,PUSH_SELF,DEBUFF_NEVER,CLASS_OLD,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_CLEVER} --Orc Skeleton
MyTact[1177]={TACT_SNIPE_H,-4,KITE_NEVER,CAST_REACT,PUSH_SELF,DEBUFF_NEVER,CLASS_OLD,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_CLEVER} --Zenorc
MyTact[1189]={TACT_REACT_H,SKILL_ALWAYS,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_S,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,2,CHASE_ALWAYS} --Orc Archer
MyTact[1078]={TACT_REACT_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,0,CHASE_NORMAL} --Red Plant
MyTact[1079]={TACT_REACT_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,0,CHASE_NORMAL} --Blue Plant
MyTact[1080]={TACT_REACT_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,0,CHASE_NORMAL} --Green Plant
MyTact[1081]={TACT_REACT_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,0,CHASE_NORMAL} --Yellow Plant
MyTact[1082]={TACT_REACT_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,0,CHASE_NORMAL} --White Plant
MyTact[1083]={TACT_REACT_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,0,CHASE_NORMAL} --Shining Plant
MyTact[1084]={TACT_REACT_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,0,CHASE_NORMAL} --Red Mushroom
MyTact[1085]={TACT_REACT_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,0,CHASE_NORMAL} --Black Mushroom
MyTact[1589]={TACT_REACT_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,0.1,CHASE_NORMAL} --Mandragora Summon
MyTact[1579]={TACT_REACT_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,0.3,CHASE_NORMAL} --Hydra Summon
MyTact[1575]={TACT_REACT_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,0.6,CHASE_NORMAL} --Flora Summon
MyTact[1555]={TACT_REACT_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_NORMAL} --Parasite Summon
MyTact[1590]={TACT_REACT_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_NORMAL} --Geographer Summon
MyTact[2158]={TACT_REACT_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,0.5,CHASE_NORMAL}
MyTact[2159]={TACT_REACT_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_NORMAL}
MyTact[2160]={TACT_REACT_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,2,CHASE_NORMAL}
MyTact[1105]={TACT_REACT_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_NORMAL} --Pierre
MyTact[1160]={TACT_REACT_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_NORMAL} --Andre
MyTact[1095]={TACT_REACT_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_NORMAL} --Deniro
MyTact[1176]={TACT_REACT_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_NORMAL} --Vitata
MyTact[1121]={TACT_REACT_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_NORMAL} --Giearth


`,
  'M_Tactics.lua': String.raw`MyTact={}
MyTact[0]={TACT_ATTACK_M,SKILL_ALWAYS,KITE_NEVER,CAST_REACT,PUSH_SELF,DEBUFF_NEVER,CLASS_BOTH,RESCUE_RETAINER,-1,SNIPE_OK,KS_NEVER,1,CHASE_NORMAL} --Default
MyTact[10]={TACT_REACT_M,SKILL_ALWAYS,KITE_REACT,CAST_REACT,PUSH_SELF,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_NORMAL} --Default Summon
MyTact[11]={TACT_REACT_M,3,KITE_NEVER,CAST_PASSIVE,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_NORMAL} --Autodetect Plant
`,
  'H_PVP_Tact.lua': String.raw`MyPVPTact={}
MyPVPTact[0]={TACT_REACT_L,SKILL_ALWAYS,KITE_NEVER,CAST_REACT,PUSH_SELF,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER}
MyPVPTact[KOS]={TACT_ATTACK_H,SKILL_ALWAYS,KITE_ALWAYS,CAST_REACT,PUSH_SELF,1,CLASS_BOTH,RESCUE_NEVER}
MyPVPTact[ENEMY]={TACT_REACT_H,SKILL_ALWAYS,KITE_ALWAYS,CAST_REACT,PUSH_SELF,1,CLASS_BOTH,RESCUE_NEVER}
MyPVPTact[NEUTRAL]={TACT_REACT_M,SKILL_ALWAYS,KITE_NEVER,CAST_PASSIVE,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER}
MyPVPTact[FRIEND]={TACT_IGNORE,SKILL_ALWAYS,KITE_NEVER,CAST_PASSIVE,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER}
MyPVPTact[ALLY]={TACT_IGNORE,SKILL_NEVER,KITE_NEVER,CAST_PASSIVE,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER}
MyPVPTact[RETAINER]={TACT_IGNORE,SKILL_NEVER,KITE_NEVER,CAST_PASSIVE,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER}
`,
  'M_PVP_Tact.lua': String.raw`MyPVPTact={}
MyPVPTact[0]={TACT_REACT_L,SKILL_ALWAYS,KITE_NEVER,CAST_REACT,PUSH_SELF,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER}
MyPVPTact[KOS]={TACT_ATTACK_H,SKILL_ALWAYS,KITE_ALWAYS,CAST_REACT,PUSH_SELF,1,CLASS_BOTH,RESCUE_NEVER}
MyPVPTact[ENEMY]={TACT_REACT_H,SKILL_ALWAYS,KITE_ALWAYS,CAST_REACT,PUSH_SELF,1,CLASS_BOTH,RESCUE_NEVER}
MyPVPTact[NEUTRAL]={TACT_REACT_M,SKILL_ALWAYS,KITE_NEVER,CAST_PASSIVE,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER}
MyPVPTact[FRIEND]={TACT_IGNORE,SKILL_ALWAYS,KITE_NEVER,CAST_PASSIVE,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER}
MyPVPTact[ALLY]={TACT_IGNORE,SKILL_NEVER,KITE_NEVER,CAST_PASSIVE,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER}
MyPVPTact[RETAINER]={TACT_IGNORE,SKILL_NEVER,KITE_NEVER,CAST_PASSIVE,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER}
`,
  'H_Extra.lua': String.raw`-- HOMUN S STUFF THAT DOESN'T HAVE GUI OPTIONS YET:
-- This is the Extra Options file
-- NewAutoFriend = 0 -- uncomment this if you're not using AzzyAI for your homun.

FriendAttack={}			--Set these to 1 to have homun attack 
				--the target of a friend/owner when the friend is:
FriendAttack[MOTION_ATTACK]=1	--Attacking normally
FriendAttack[MOTION_ATTACK2]=1	--Attacking normally
FriendAttack[MOTION_SKILL]=1	--Uses a skill (which has the normal skill animation)
FriendAttack[MOTION_CASTING]=1	--Is casting a skill with a casting time
FriendAttack[MOTION_TOSS]=0	--Uses SpearBoom/AidPot/other "throwing" things
FriendAttack[MOTION_BIGTOSS]=1	--Uses Acid Bomb
FriendAttack[MOTION_FULLBLAST]=1	--Uses Full Blast


BasicDebuffs={}
BasicDebuffs[MER_CRASH]=	1
BasicDebuffs[MER_LEXDIVINA]=	1
BasicDebuffs[MER_DECAGI]=	1
BasicDebuffs[MA_SANDMAN]=	1
BasicDebuffs[MA_FREEZINGTRAP]=	1

--[[
Tactics switching:
You may desire to switch your tactics based on conditions. The can be accomplished by making a second tactics file, and including a require "./AI/USER_AI/(your tactics file name)", and uncommenting the lines below
Replace the "1==1" test with a test of your choice (you can test if a player of a specific ID is on screen with Players[player id]~=nil (this will be true if the player is on the screen)) and so on. 
This feature is not guaranteed and may not function as intended.
Dr. Azzy takes no responsibility for your lua programming; I barely take responsibility or my own. 
]]--
--function GetMyTact(e)
--	if (1==1) then 
--		return MyTact[e]
--	else if MyAltTact[e]~= nil then
--		return MyAltTact[e]
--	end
--end
`,
  'M_Extra.lua': String.raw`-- This is the Extra Options file
-- NewAutoFriend = 0 -- uncomment this if you're not using AzzyAI for your homun.

FriendAttack={}			--Set these to 1 to have homun attack 
				--the target of a friend/owner when the friend is:
FriendAttack[MOTION_ATTACK]=1	--Attacking normally
FriendAttack[MOTION_ATTACK2]=1	--Attacking normally
FriendAttack[MOTION_SKILL]=1	--Uses a skill (which has the normal skill animation)
FriendAttack[MOTION_CASTING]=1	--Is casting a skill with a casting time
FriendAttack[MOTION_TOSS]=0	--Uses SpearBoom/AidPot/other "throwing" things
FriendAttack[MOTION_BIGTOSS]=1	--Uses Acid Bomb
FriendAttack[MOTION_FULLBLAST]=1	--Uses Full Blast


BasicDebuffs={}
BasicDebuffs[MER_CRASH]=	1
BasicDebuffs[MER_LEXDIVINA]=	1
BasicDebuffs[MER_DECAGI]=	1
BasicDebuffs[MA_SANDMAN]=	1
BasicDebuffs[MA_FREEZINGTRAP]=	1
`,
};
