<?php

$arxivs = $config->get("arxivs");
$timestamp = $params->getDate();
$date = date("Y-m-d", $timestamp);

$votes = array();
if($user->isLoggedIn()) {
  $userId = $user->id();
  $query = "SELECT * FROM votes WHERE userId = ?";
  $result = $coffee_conn->boundQuery($query, array('s', &$userId));

  $votes = array();
  foreach($result as $row) {
    $votes[$row["paperId"]] = $row["value"];
  }
}

foreach($arxivs as $arxiv) {
?>
<div class="panel panel-default">
  <div class="panel-heading panel-toggle">
    <h3 class="panel-title">Papers from <?php print $arxiv; ?></h3>
  </div>
  <div class="panel-body">
    <ul class="feed">
    <?php
      $query = "SELECT * FROM papers WHERE subject = '$arxiv' AND date BETWEEN '{$date} 00:00:00' AND '{$date} 23:59:59'";
      $result = $coffee_conn->dbQuery($query);
      foreach($result as $paper) {
        ?>
        <li class='article' id='article-<?php print $paper->id; ?>' paperId='<?php print $paper->id; ?>' >
          <h4><?php print format_arxiv_title($paper->title); ?></h4>
          <h5><?php print $paper->authors; ?></h5>
          <button type="button" class="btn btn-xs btn-success btn-upvote" aria-label="Left Align" data-toggle="tooltip" data-placement="bottom" title="Increase Rating">
            <span class="glyphicon glyphicon-align-left glyphicon-thumbs-up" aria-hidden="true"></span>
          </button>
          <button type="button" class="btn btn-xs btn-danger btn-downvote" aria-label="Left Align" data-toggle="tooltip" data-placement="bottom" title="Decrease Rating">
            <span class="glyphicon glyphicon-align-left glyphicon-thumbs-down" aria-hidden="true"></span>
          </button>
          <?php if(isset($votes[$paper->id])) { ?>
            <?php if($votes[$paper->id] > 0) { ?>
              <span class='article-messages bg-success' id='article-<?php print $paper->id; ?>-messages'>
              <?php print "Rated: +" . $votes[$paper->id]; ?>
            <?php } else { ?>
              <span class='article-messages bg-danger' id='article-<?php print $paper->id; ?>-messages'>
              <?php print "Rated: " . $votes[$paper->id]; ?>
            <?php } ?>
            </span>
          <?php } else { ?>
            <span class='article-messages' id='article-<?php print $paper->id; ?>-messages'></span>
          <?php } ?>
          <p><?php print $paper->abstract; ?></p>
        </li>
        <?php
      }
    ?>
    </ul>
  </div>
</div>
<?php
}