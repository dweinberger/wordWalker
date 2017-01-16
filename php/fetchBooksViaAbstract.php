<?php
	
ini_set('display_errors','On');
error_reporting(E_ALL);



// ----- Take array of words from abstract and other fields, fetch new books based on them
//    		The javascript now does the discovery of word usages and does the ranking.

function debugPrint($s){
	if (1==2){
		//error_log($s);
		print("<p>$s</p>");
	}
}

debugPrint("------FetchBooksViaAbstract.php---------");

function replaceBadChars($origs){
return $origs;
	// replace problematic characters
	$s1 = str_replace(array('\\','|', '/', '-','*',',','?','%'), "", $origs);
	// replace the multiple contiguous spaces left (or urlencode gives  multipole +
	$s2 = preg_replace('#\s+#', ' ', $s1);
	// make it safe for web passage
	$s3 = urlencode($s2);
	return $s3;
}



$origsearchwords = $_REQUEST['searchwords'];

$words = json_decode($origsearchwords, true);
//$words =["examination","orthopedic"];
debugPrint("Words = $words[0] , $words[1] ");

// DUBLIN CORE QUERY
$basequery = "http://api.lib.harvard.edu/v2/items.dc.json?q=";
	$ch = curl_init(); 
	
	
				
$ctr = 0;
	
$allWordsAllResults = array();

// for each word, get ten results
for ($i=0; $i < count($words); $i++){
	$word = $words[$i];
	$query = $basequery . $words[$i];
	debugPrint("$i) WORD=$word > QUERY = $query");
	// $word2 = replaceBadChars($word);
	$query = $basequery . $word;
	//debugPrint("<pre>query $i : $query</pre>");
	curl_setopt($ch, CURLOPT_URL, $query);
	// Return the transfer as a string 
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
	// $output contains the output string 
	$ret = curl_exec($ch); 
	
	
	$oneWordsResults = json_decode($ret,true); // true makes it come back as an associative array, not an object
	
	// go through each book returned for each word chosen by user
	// and build a long string concatening abstract, title, and Tocr
	foreach($oneWordsResults['items']['dc'] as $book){
		//debugPrint("word: " . $words[$i]);
		// -- Abstract
		if (array_key_exists("description",$book)){
			$abstractarray = $book["description"];
			if (is_array($abstractarray)){
				$abstract = join("\n ", $abstractarray);
			}
			else{
				$abstract = $abstractarray;
			}
		}
		else {
			$abstract = "";
		}
		
		// -- author
		$author = "";
		if (array_key_exists("creator",$book)){
			if (is_array($book["creator"])){
				$author = join(";", $book["creator"]);	
			}
		}
		else {
			if (array_key_exists("contributor",$book)){
				if (is_array($book["contributor"])){
					$author = join(";", $book["contributor"]);	
				}
			}
		}
		
		
		
		// -- Title
		$title = "";
		if (array_key_exists("title",$book)){
			if (is_array($book["title"])){
				$title = join(": ", $book["title"]);
			}
			else{
				$title = $book["title"];
			}
	}
		
		// -- ID
		$id = "";
		if (array_key_exists("identifier",$book)){
			// cycle through looking for librarycloud
			for ($g = 0; $g < count($book["identifier"]); $g++){
				$key = (substr($book["identifier"][$g],0,13));
				if ($key == "librarycloud:"){
					$id = $id = substr($book["identifier"][$g],13);
					//debugPrint("<br>ID: " .$id . "<br>");
				}
			}
			
			}

		
		// -- Subjects
		$subject = "";
		if (array_key_exists("subject",$book)){
			$subject = join(";", $book["subject"]);	
			//debugPrint("<li>subject: " . $subject . "</li>");
		}
		else {
			$subject = "";
		}
				
		$bookchunks = array();
		$bookchunks["word"] 	= replaceBadChars($words[$i]);
		$bookchunks["id"] 		= replaceBadChars($id);
		$bookchunks["abstract"] = replaceBadChars($abstract);
		$bookchunks["title"] 	= replaceBadChars($title);
		$bookchunks["author"] 	= replaceBadChars($author);
		$bookchunks["subjects"] = replaceBadChars($subject);
		// the javascript needs the 'score' key even if the php doesn't do
		// any actual scoring
		$bookchunks["score"] = 0;
		
		$allWordsAllResults[] = $bookchunks;
		
		
	} // single book's info ... 1 of up to 10 books for each search term
	
	
	$ctr++;
} // gone through all search terms

debugPrint("<h2>=======COUNT: "  .  count($allWordsAllResults) . " BOOKS RETURNED ===================</h2>");

echo json_encode($allWordsAllResults, JSON_HEX_QUOT);



?>

