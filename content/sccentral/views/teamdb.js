function teamDBView() {
    $("#rightcontent").empty() ;
    let div = document.createElement("div") ;
    div.innerHTML = "<b>Team data loading.  Please wait ....</b>" ;
    div.id = "info" ;
    $("#rightcontent").append(div) ;

    window.scoutingAPI.send("get-team-db");
}

function updateTeamData(args) {
    $("#rightcontent").empty() ;
    let div = document.createElement('div') ;
    $("#rightcontent").append(div) ;
    div.id = 'tablediv' ;

    let cols = [] ;
    for(let col of args.cols) {
        let coldesc = {
            field: col,
            title: col,
            headerMenu:headerMenu
        } ;
        cols.push(coldesc) ;
    }

    var table = new Tabulator(div, 
        {
            data:args.data,
            layout:"fitDataStretch",
            resizableColumnFit:true,
            columns:cols,
            movableColumns: true,
        });
    table.id = 'table' ;
}

window.scoutingAPI.receive("send-team-db", (args)=>updateTeamData(args[0])) ;