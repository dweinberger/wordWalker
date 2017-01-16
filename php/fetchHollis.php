<?php
	
ini_set('display_errors','On');
error_reporting(E_ALL);

function debugPrint($s){
	if (1==2){
		error_log($s);
	}
}

$origsearchterm = $_REQUEST['searchterm'];
$searchtype = "KEYWORD"; // debug for now

debugPrint("term: $origsearchterm");

// replace problematic characters
$s1 = str_replace(array('\\','|', '/', '-','*',',','?','%'), "", $origsearchterm);
// replace the multiple contiguous spaces left (or urlencode gives  multipole +
$s2 = preg_replace('#\s+#', ' ', $s1);
// make it safe for web passage
$searchterm = urlencode($s2);

debugPrint("searchterm after str_replace: $searchterm");
// sample:
// http://api.lib.harvard.edu/v2/items.json?subject=peanuts


if ($searchtype == "KEYWORD"){
	$queryurl = "http://api.lib.harvard.edu/v2/items.json?q=" . $searchterm;
	debugPrint("KEYWORD: $queryurl");
}
if ($searchtype == "SUBJECT"){
	$queryurl = "http://api.lib.harvard.edu/v2/items.json?subject=" . $searchterm;
	debugPrint("SUBJECT query: $queryurl");
}

// the WEAK search is a subject search and a keyword search. The two terms
// are combined with ||| separating them.



	$ch = curl_init(); 
	curl_setopt($ch, CURLOPT_URL, $queryurl);
	// Return the transfer as a string 
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
	// $output contains the output string 
	$ret = curl_exec($ch); 
	$recorddecoded = json_decode($ret);
	
	
	curl_close($ch);

echo json_encode($recorddecoded);

?>