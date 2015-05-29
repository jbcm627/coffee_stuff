
function format_search_results(xml) {
  var html = $.map( $("entry", xml), function(val, i) {
    var import_button_text = "";
    if(isLoggedIn) {
      import_button_text = "<a href='#' id='search-result-import-" + i + "' type='button' class='btn btn-default'>"
            +     "<span class='glyphicon glyphicon-import'></span>"
            +     " Import "
            +   "</a>";
    }
    return "<li>"
            + $("title", val).text()
            + " <div class='btn-group btn-group-xs' role='group'>"
            +   import_button_text
            +   "<a href='" + $("id", val).text() + "' type='button' class='btn btn-default'>"
            +     "<span class='glyphicon glyphicon-share'></span>"
            +     " View on arXiv "
            +   "</a>"
            + "</div>"
            + "</li>";
  }).join("");

  if(!html) {
    html = "<li>No results found!</li>";
  }

  hide_search_spinner();
  $("#arxiv_search_results").html("<ul class='list-unstyled'>" + html + "</ul>");

  $.map( $("entry", xml), function(val, i) {
    $("#search-result-import-" + i).on("click", function(e) {
      e.preventDefault();
      var id_pattern = /http\:\/\/arxiv\.org\/abs\//i
      var arxiv_id = $("id", val).text().replace(id_pattern, "");
      var arxiv_category = $("category", val).attr("term");
      var data = {
        "import-id": $("id", val).text(),
        title: $("title", val).text() + " (arxiv:" + arxiv_id +  " [" + arxiv_category + "])",
        authors: $("author", val).text(), // could be improved
        abstract: $("summary", val).text(),
        section: arxiv_category,
      };
      console.log("Importing paper...", data);
      $.ajax({
        url: 'js/import.php',
        type: 'GET',
        dataType: 'json',
        data: data,
        success: function(json) {
          console.log(json);
          if(json.hasOwnProperty("errors") || !json.hasOwnProperty("postId")) {
            console.log(json.errors);
            $("#search-result-import-"+i).html("<i class='fa fa-times-circle'></i> Import failed!");
          } else {
            $("#search-result-import-"+i).off();
            $("#search-result-import-"+i).on("click", function(e) {
              e.preventDefault();
              document.location.href = 'post.php?post-id=' + json.postId;
            });
            $("#search-result-import-"+i).html("<i class='fa fa-check-circle'></i> View Paper.");
            $("#search-result-import-"+i).addClass("btn-success");
          }
        },
        error: function(err) {
          $("#search-result-import-"+i).html("<i class='fa fa-times-circle'></i> Import failed!");
          console.log(err);
        }
      });
    });
  });
}

function perform_search(value) {
  var order = $("#arxiv_search_order").val();
  $.ajax({
    url: 'https://export.arxiv.org/api/query',
    type: 'GET',
    dataType: 'xml',
    data: {
      search_query: value,
      sortBy: order,
      start: 0,
      max_results: 10
    },
    success: function(xml) {
      format_search_results(xml);
    },
  });
}

function show_search_spinner() {
  $("#arxiv_search_spinner").html("<i class='fa fa-spinner fa-pulse'></i>");
}

function hide_search_spinner() {
  $("#arxiv_search_spinner").html("<i class='fa fa-check-circle-o'></i>");
} 

$(document).ready(function() {
  $("#arxiv_search").typeWatch({
    callback: perform_search,
    wait: 250,
    captureLength: 0
  });

  $("#arxiv_search").on("input", show_search_spinner);

  $("#arxiv_search_order_relevance").on("click", function(e) {
    e.preventDefault();
    $("#arxiv_search_order").val("relevance");
    $("#arxiv_search_order_text").text("relevance");
    perform_search(
      $('#arxiv_search').val()
    );
  });

  $("#arxiv_search_order_lastUpdatedDate").on("click", function(e) {
    e.preventDefault();
    $("#arxiv_search_order").val("lastUpdatedDate");
    $("#arxiv_search_order_text").text("date");
    perform_search(
      $('#arxiv_search').val()
    );
  });

  $('#searchModal').on('shown.bs.modal', function(e) {
    $('#arxiv_search').focus();
  })
});