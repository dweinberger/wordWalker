<?php

	$hollisid = $_REQUEST['hollisid'];

	// test - this works:
	//$queryurl="http://hlslwebtest.law.harvard.edu/v2/api/item/?filter=collection:hollis_catalog%20AND%20id_inst:009487775";

	$queryurl = "http://hlslwebtest.law.harvard.edu/v2/api/item/?filter=collection:hollis_catalog%20AND%20id_inst:" . $hollisid;

	$ch = curl_init(); 
	curl_setopt($ch, CURLOPT_URL, $queryurl);
	// Return the transfer as a string 
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
	$ret = curl_exec($ch); 
	$recorddecoded = json_decode($ret);
	curl_close($ch);

	// this gets the stacklife id
	$stacklifeid = $recorddecoded->docs[0]->id;

	echo $stacklifeid;
?>