<?php
	
ini_set('display_errors','On');
error_reporting(E_ALL);


// ----- Take array of words from abstract, fetch new books, rank them

function debugPrint($s){
	if (1==2){
		//error_log($s);
		echo($s);
	}
}

debugPrint("------FfetchBooksViaAbstract.php---------");

function replaceBadChars($origs){
	// replace problematic characters
	$s1 = str_replace(array('\\','|', '/', '-','*',',','?','%'), "", $origs);
	// replace the multiple contiguous spaces left (or urlencode gives  multipole +
	$s2 = preg_replace('#\s+#', ' ', $s1);
	// make it safe for web passage
	$s3 = urlencode($s2);
	return $s3;
}



$origsearchwords = $_REQUEST['searchwords'];

//debugPrint("origWORDS: " . $wordstr );

//var_dump($origsearchwords);
$words = json_decode($origsearchwords);
//$words =["evolution","darwin","giraffe"];



$basequery = "http://api.lib.harvard.edu/v2/items.json?q=";
	$ch = curl_init(); 
	
$allWordsAllResults = array();
// allWordsAllResults:
// 		items:
// 			mods: 
// 					modsstring:string
// 					normal mods stuff:
// 			mods: : etc.
// //   items: ...
				
				
$ctr = 0;
	
// for each word, get ten results
for ($i=0; $i < count($words); $i++){
	$word = $words[$i];
	$query = $basequery . $words[$i];
	//debugPrint("$i) WORD=$word > QUERY = $query");
	// $word2 = replaceBadChars($word);
	$query = $basequery . $word;
	curl_setopt($ch, CURLOPT_URL, $query);
	// Return the transfer as a string 
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
	// $output contains the output string 
	$ret = curl_exec($ch); 
	
	
	$oneWordsResults = json_decode($ret,true); // true makes it come back as an associative array, not an object
	//var_dump($oneWordsResults);
	//debugPrint("<hr><p> version: " . $oneWordsResults['items']['mods'][0]['version'] );

	
	// for each of the ten results for this book,
	// create a pure string version of the array.
	// We'll have an array of ten strings for each word.
	//debugPrint ("<p>$i Number of results: " . count($oneWordsResults));
	$j=-1;
	$onewordsresultsarray = array();
	
	//foreach($oneWordsResults['items'] as $key=>$val){
	foreach($oneWordsResults['items'] as $key=>&$item){
		// $stringversion = print_r($oneWordsResults[$j], true);
		// get the string version of one result for this word
		$stringversionlowercase= print_r($item['mods'], true);
		$stringversion = strtoupper($stringversionlowercase); // uppercase it
		$j++;
		// add a new key-value to each mods element of this result for this word
		//$oneWordsResults['items']['mods'][$j]['modsstring'] = $stringversion;
		$item["mods"]["modsstring"] = $stringversion;
		//debugPrint("<hr><p>adding modstring $j<br>" . $item['mods']['modsstring'] );
		
		}
	// add the array of one word's results to a grand array
	$allWordsAllResults[] = $oneWordsResults;
	$ctr++;
	//debugPrint("<hr><p>$i modstring: " . $allWordsAllResults['items']['mods'][0]['modsstring'] );


}


// now go through the array  of returned book strings.
// Each element has the stringified results (usually ten) for that word.
// Look for words that are used the most in the 
// the returned records, with extra points if they're used in the
// abstract or TOC


// --- go through the returns for each word, looking for each word in 
//     each result
	/* $wordcounts= [{searchword : the word on the word list,
					whichresult : [word number on wordlist, resultnumber for that word],
					timesused : counter of times found in all results}]				
	*/
	
/// look for words
	$wordcounts = array(); // wordcounts[whichword][whichresult]
	$oneWordsresultstrings = array();
	$a=-1;
	$b=-1;
	foreach($allWordsAllResults as $key=>&$val){ // words complete json
		$a++;
		$b=-1;
		foreach($val["items"] as $key=>&$item){ // one word's items
			$b++;
			$c= -1;
			foreach($item as $key=>&$mds){ // the returns for one word
				$c++;
				$resultstring = $mds['modsstring'];
				// for each resultstring, count occurrences for each searchterm
				$totalcount = 0;
				for ($j=0; $j < count($words); $j++){
					// how many times is it used in the string?
					$times = substr_count($resultstring,strtoupper($words[$j]));
					// count how many times the targetwords are used
					$totalcount = $totalcount + $times;
					//debugPrint("<br>relcount = $totalcount");
				}
				// store this for each 
				$mds['wordcount'] = $totalcount;
				$wordcounts[$a][$b] = $totalcount;
				// nuke the big string
				$mds['modsstring'] = "";		
			}	
		}
	}
	
	//these work:
	// debugPrint("<h1>INDEX RETRIEVAL: " . $allWordsAllResults[0]["items"][0]["mods"]["version"] . "</h1>");
	//debugPrint("<h1>INDEX: " . $allWordsAllResults[1]["items"][2]["mods"]["modsstring"] . "[end]</h1>");
	

// aggregate totals for identical words
debugPrint("<p>Wordcounts length: " . count($wordcounts));
for ($i=0; $i < count($wordcounts); $i++){
	debugPrint("<li>In aggregating: $i. Word=" . $words[$i]);
	$w = $words[$i];
	$matched = false;
	for ($j = $i + 1; $j < count($words); $j++){
		//debugPrint("In J aggregating: j = $j, i= $i");
		if ($words[$j] === $words[$i]){
			$matched = true;
			for ($b=0; $b < count($wordcounts[$i]); $b++){ 
				$wordcounts[$i][$b] = $wordcounts[$i][$b] + $wordcounts[$j][$b];
				// void the second instance of the word
				$wordcounts[$j][$b] = "[[VOID]]";
			}
		}
	}
}


// Find the 10 highest wordcounts
$sorted = array();
$where=array(-1,-1);
for ($x=0; $x < 10; $x++){
	debugPrint("<li>xxxxxxxx X=$x");
	$highest = 0;
	for ($i=0; $i < count($wordcounts); $i++){
		for ($b=0; $b < count($wordcounts[$i]); $b++){
			$times = $wordcounts[$i][$b];
			debugPrint("<li>finding highest wordcounts: i=$i b=$b times = $times");
			if ( ($times > $highest) && ($times !== "[[VOID]]") ){
				$highest = $times;
				$where = array($i,$b);
			}	
		}
	}
	// put the highest into an array
	$sorted[] = array("where"=>$where, "times"=>$highest);
	// remove this from the array we're sorting
	$wordcounts[$where[0]][$where[1]] = -1;
}

debugPrint("<h1>SsORTED</h1>");
$topten = array();
// are there ten results in the sorted array?
if (count($sorted) < 10){
	$sortedlen = count($sorted);
}
else{
	$sortedlen = 10;
}
for ($i=0; $i < $sortedlen; $i++){
	$whichword = $sorted[$i]["where"][0];
	$whichresult = $sorted[$i]["where"][1];
	
	debugPrint("TOPTEN $i word$ = ". $whichword . " word=" . $words[$whichword] . " Result#:" . $whichresult . " times:" . $sorted[$i]["times"]);
	$topten[] =$allWordsAllResults[$whichword]["items"][$whichresult];
	//$topten[] = $allWordsAllResults[$whichword][$whichresult];
	}


//debugPrint("<h1 style='color:blue'>TOP TEN</h1>");
echo json_encode($topten);



?>

