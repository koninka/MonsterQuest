<?php
// RF(STUPID,      "")
// RF(SMART,       "")
// RF(HAS_LIGHT,   "")
// RF(COLD_BLOOD,  "cold blooded")
// RF(EMPTY_MIND,  "not detected by telepathy")
// RF(WEIRD_MIND,  "rarely detected by telepathy")
// RF(POWERFUL,    "")
// RF(BRAIN_1,     "")
// RF(BRAIN_2,     "")
// RF(BRAIN_3,     "")
// RF(BRAIN_4,     "")
// RF(BRAIN_5,     "")
// RF(BRAIN_6,     "")
// RF(BRAIN_7,     "")
// RF(BRAIN_8,     "")
// RF(RES_NETH,    "nether")
// RF(RES_PLAS,    "plasma")
// RF(RES_NEXUS,   "nexus")
// RF(RES_DISE,    "disenchantment")

$forbidden_flags = [
   'NONE',
   'UNIQUE',
   'QUESTOR',
   'MALE',
   'FEMALE',
   'CHAR_CLEAR',
   'ATTR_RAND',
   'ATTR_CLEAR',
   'ATTR_MULTI',
   'FORCE_DEPTH',
   'UNAWARE',
   'FORCE_SLEEP',
   'FORCE_EXTRA',
   'GROUP_AI',
   'SEASONAL',
   'XXX11',
   'XXX12',
   'RAND_25',
   'RAND_50',
   'ONLY_GOLD',
   'ONLY_ITEM',
   'ATTR_FLICKE',
   'MULTIPLY',
   'MIMIC_INV',
   'XXX1',
   'XXX2',
   'XXX3',
   'XXX4',
   'XXX5',
   'XXX6',
   'XXX7',
   'XXX8',
   'XXX9',
   'PASS_WALL',
   'KILL_WALL',
   'MOVE_BODY',
   'KILL_BODY',
   'NONLIVING'
];

$mon_flags = [
   'INVISIBLE',
   'COLD_BLOOD',
   'NEVER_BLOW',
   'NEVER_MOVE',
   'DROP_40',
   'DROP_60',
   'DROP_1',
   'DROP_2',
   'DROP_3',
   'DROP_4',
   'DROP_GOOD',
   'DROP_GREAT',
   'DROP_20',
   'REGENERATE',
   'PASS_WALL',
   'KILL_WALL',
   'TAKE_ITEM',
   'KILL_ITEM',
   'TAKE_ITEM',
   'KILL_ITEM',
   'ORC',
   'TROLL',
   'GIANT',
   'DRAGON',
   'DEMON',
   'UNDEAD',
   'EVIL',
   'ANIMAL',
   'METAL',
   'HURT_LIGHT',
   'HURT_ROCK',
   'HURT_FIRE',
   'HURT_COLD',
   'IM_ACID',
   'IM_ELEC',
   'IM_FIRE',
   'IM_COLD',
   'IM_POIS',
   'IM_WATER',
   'NO_FEAR',
   'NO_STUN',
   'NO_CONF',
   'NO_SLEEP'
];

$spell_flags = [
   'SHRIEK',
   'BR_ACID',
   'BR_ELEC',
   'BR_FIRE',
   'BR_COLD',
   'BR_POIS',
   'BR_LIGHT',
   // 'BR_DARK',
   'BR_CONF',
   'BR_INER',
   // 'BR_GRAV', //gravity
   'BA_ACID',
   'BA_ELEC',
   'BA_FIRE',
   'BA_COLD',
   'BA_POIS',
   'BA_WATE',
   // 'BA_DARK',
   'DRAIN_MANA',
   'BO_ACID',
   'BO_ELEC',
   'BO_FIRE',
   'BO_COLD',
   'BO_POIS',
   'BO_WATE',
   'BO_PLAS',
   'BO_ICEE',
   'SCARE',
   'BLIND',
   'CONF',
   'SLOW',
   'HOLD',
   'HASTE',
   'HEAL',
   'BLINK',
   'TPORT',
   // 'TELE_TO',
   // 'TELE_AWAY',
   // 'TELE_LEVEL',
   // 'DARKNESS',
   'TRAPS',
];

$mobs      = [];
$templates = [];

class MonParser
{

   static $BASE_CONFORMITY = [
      'G' => 0,
      'M' => 1,
      'F' => 2,
      'S' => 3,
      'D' => 4
   ];

   static private function _ExplodeByPipe($str)
   {
      return array_map('trim', explode('|', trim($str)));
   }

   static private function _ParseBaseTemplateFlag($line, &$result)
   {
      switch ($line[0]) {
         case 'G':
            $result['G'] = GetValueByKey($line);
            break;

         case 'M':
            $result['M'] = GetValueByKey($line);
            break;

         case 'F':
            $result['F'] = array_merge($result['F'], static::_ExplodeByPipe(GetValueByKey($line)));
            break;

         case 'S':
            $result['S'] = array_merge($result['S'], static::_ExplodeByPipe(GetValueByKey($line)));
            break;

         case 'D':
            $result['D'] = GetValueByKey($line);
            break;
      }
      return isset(static::$BASE_CONFORMITY[$line[0]]);
   }

   static public function ParseBaseTemplate(&$content, &$i)
   {
      $result = [
         'G' => null, 'M' => null, 'F' => [], 'S' => [], 'D' => null
      ];
      while ($i < count($content) && !empty(trim($content[$i]))) {
         $line = $content[$i++];
         static::_ParseBaseTemplateFlag($line, $result);
      }
      return $result;
   }

   static public function ParseTemplate(&$content, &$i)
   {
      $r = [
         'G' => null, 'M'  => null, 'F' => [],   'S'  => [],
         'D' => null, 'C'  => null, 'I' => null, 'W'  => null,
         'B' => null, 'SF' => null, 'T' => null, '-F' => []
      ];
      while ($i < count($content) && !empty(trim($content[$i]))) {
         $line = $content[$i++];
         if (static::_ParseBaseTemplateFlag($line, $r)) continue;
         switch ($line[0]) {
            case 'C':
               $r['C'] = GetValueByKey($line);
               break;

            case 'T':
               $r['T'] = GetValueByKey($line);
               break;

            case 'I':
               $r['I'] = GetValueByKey($line);
               break;

            case 'W':
               $r['W'] = GetValueByKey($line);
               break;

            case 'B':
               $r['B'] = GetValueByKey($line);
               break;

            default:
               if (substr($line, 0, 2) != '-F') break;
               $r['-F'] = array_merge($r['-F'], static::_ExplodeByPipe(GetValueByKey($line)));
         }
      }
      global $templates;
      if (
            !static::CheckForPossibleFlags('F', $r)
         || !static::CheckForPossibleFlags('S', $r)
         || empty($t = &$templates[$r['T']])

      ) {
         $r = [];
      } else {
         $r['S']   = array_merge($r['S'], $t['S']);
         $r['F'] = array_diff(array_merge($r['F'], $t['F']), $r['-F']);
         unset($r['-F']);
         $r['M']  = $t['M'];
         $r['G'] = !empty($r['G']) ? $r['G'] : $t['G'];
      }
      return $r;
   }

   static public function CheckForPossibleFlags($flag_name, &$info)
   {
      global $spell_flags, $mon_flags, $forbidden_flags;
      $isSpell = $flag_name == 'S';
      foreach ($info[$flag_name] as $flag) {
         $result = $isSpell ? in_array($flag, $spell_flags) : !in_array($flag, $forbidden_flags);
         if (!$result) {
            return false;
         }
      }
      if (!$isSpell) {
         foreach ($info[$flag_name] as $key => $flag) {
            if (!in_array($flag, $mon_flags)) {
               unset($info[$flag_name][$key]);
            }
         }
      }
      return true;
   }

}

function GetValueByKey($str, $idx = 1)
{
   return trim(explode(':', $str)[$idx]);
}

$content = file('a_monster_base.txt');

$i = 0;
while ($i < count($content)) {
   $line = $content[$i++];
   if ($line[0] == '#') continue;
   if ($line[0] == 'N') {
      $templates[$key = GetValueByKey($line)] = MonParser::ParseBaseTemplate($content, $i);
      if (
            !MonParser::CheckForPossibleFlags('F', $templates[$key])
         || !MonParser::CheckForPossibleFlags('S', $templates[$key])
      ) {
         unset($templates[$key]);
      }
   }
}

$i = 0;
echo "temaplate names:\n";
foreach ($templates as $key => $value) {
   echo "\t" . $i++ . " $key\n";
}

$content = file('a_monster.txt');

$i = 0;
while ($i < count($content)) {
   $line = $content[$i++];
   if ($line[0] == '#') continue;
   if ($line[0] == 'N') {
      $mobs[$key = GetValueByKey($line, 2)] = MonParser::ParseTemplate($content, $i);
      if (empty($mobs[$key])) unset($mobs[$key]);
   }
}

$i = 0;
echo "mob names:\n";
foreach ($mobs as $key => $value) {
   echo "\t" . $i++ . " $key\n";
}

function WriteLineToFile(&$f, $line = '')
{
   fwrite($f, "$line\n");
}

$f = fopen('monsters.txt', 'w');
foreach ($mobs as $name => $info) {
   WriteLineToFile($f, "N:$name");
   foreach ($info as $key => $value) {
      if ($key == 'T' || $key == 'SF') continue;
      if ($key == 'F' || $key == 'S') {
         WriteLineToFile($f, "$key:" . implode('|', $value));
      } else {
         WriteLineToFile($f, "$key:$value");
      }
   }
   WriteLineToFile($f);
}
print_r(count($mobs));