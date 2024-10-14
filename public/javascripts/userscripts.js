
//this add selected news to user my news 
document.addEventListener('DOMContentLoaded', function() {
    //document.getElementById('resultsTable').addEventListener('click', function(event) {
    document.body.addEventListener('click',function() {
        if (event.target && event.target.className.includes('add-to-my-news')) {
            const newsLinkElement = event.target.closest('tr').querySelector('a.news-link');
            const newsLink = newsLinkElement.href; // The URL of the news item
            const newsTitle = newsLinkElement.textContent; // The text content/title of the news item
            const accessToken = localStorage.getItem('accessToken');

            console.log("Add to my news button clicked");
            console.log("News title:", newsTitle);
            console.log("News link:", newsLink);

            // Your AJAX call remains the same, you might just include newsTitle in the data you send
            $.ajax({
                url: '/mypage/addToMyNews',
                type: 'POST',
                contentType: 'application/json',
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
                },
                data: JSON.stringify({
                    newsId: newsLink, // Assuming your backend can handle this as an ID
                    newsTitle: newsTitle // Including the news title in the request
                }),
                success: function(response) {
                    console.log("Successfully added to my news");
                },
                error: function(xhr, status, error) {
                    console.log("Error adding to my news:", error);
                }
            });
        }
    });
});


