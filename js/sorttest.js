function sortTest(){

	r = new Array("aa","bb");
	r[0].push({'title': 't1', 'score': 100, 'stackscore' : 1});
	r[0].push({'title': 't2', 'score': 0, 'stackscore' : 21});
	r[0].push({'title': 't3', 'score': 0, 'stackscore' : 31});
	r[0].push({'title': 't4', 'score': 80, 'stackscore' : 91});
	r[0].push({'title': 't5', 'score': 0, 'stackscore' : 10});
	
	r[1].push({'title': 't6', 'score': 0, 'stackscore' : 12});
	r[1].push({'title': 't7', 'score': 0, 'stackscore' : 0});
	r[1].push({'title': 't8', 'score': 99, 'stackscore' : 30});
	r[1].push({'title': 't9', 'score': 90, 'stackscore' : 40});
	r[1].push({'title': 't10', 'score': 40, 'stackscore' : 0});
	
	var newrank = rankNewBooks(r);

}





function rankNewBooks(books){
	// sort through all the returned books for all the search terms
	// and figure out which are the most relevant, based on
	// how often the searchterms are found in the metadata
	
	points.sort(function(a, b){return a-b});
	
	
	var sortable = [];
	for (var vehicle in maxSpeed)
    	sortable.push([vehicle, maxSpeed[vehicle]])

sortable.sort(function(a, b) {
    return a[1] - b[1]
	
	books.sort(function() {
    	return a.score - b.score;
	});
	
	return books;
}
