# StudySync Offline Page HTML

Here's the simple themed offline HTML code that matches the StudySync app's blue and white theme:

```html
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
  <title>StudySync - Offline</title>
  <style type="text/css"> 
    :root { --background-color: #f8fafc; --primary-color: #1e293b; --accent-color: #3b82f6; }
    [data-theme="dark"] { --background-color: #0f172a; --primary-color: #f1f5f9; --accent-color: #60a5fa; }
    [data-theme="light"] { --background-color: #f8fafc; --primary-color: #1e293b; --accent-color: #3b82f6; }
    html, body{ background: linear-gradient(135deg, var(--background-color) 0%, #e0f2fe 100%); }
    html, body, button { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 18px; } 
    div.container { color: var(--primary-color); position: relative; top: 100px; text-align: center; } 
    #logo>svg>g>path{ fill: var(--accent-color); }
    button { padding: 10px 30px; margin: 4px 2px; background: linear-gradient(135deg, var(--accent-color) 0%, #1d4ed8 100%); color: white; border: none; border-radius: 8px; cursor: pointer; }
  </style>
</head>
<body>
  <div class="container">
    <div id="logo">
      <svg width="120" height="96" viewBox="0 0 120 96" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_5510_497)"><path d="M118.275 87.9562L7.27647 0.958312C6.45147 0.313687 5.47272 0 4.50522 0C3.17022 0 1.84459 0.592125 0.959779 1.72294C-0.575284 3.68062 -0.234596 6.51 1.72253 8.04187L112.554 94.8731C114.523 96.4112 117.348 96.0596 118.871 94.1085C120.581 92.325 120.225 89.4937 118.275 87.9562Z" fill="currentColor"/><path opacity="0.4" d="M36 53.8313C32.6869 53.8313 30 56.5163 30 59.6625V89.4937C30 92.8069 32.6869 95.4937 36 95.4937C39.3131 95.4937 42 92.8069 42 89.4937V59.6625C42 56.6813 39.3187 53.8313 36 53.8313ZM54 90C54 93.3131 56.6869 96 60 96C63.3131 96 66 93.3131 66 90V69.8625L54 60.4575V90ZM12 71.8313C8.68687 71.8313 6 74.5163 6 77.6625V89.4937C6 92.8069 8.68687 95.4937 12 95.4937C15.3131 95.4937 18 92.8069 18 89.4937V77.6625C18 74.6813 15.3131 71.8313 12 71.8313ZM60 36C57.9937 36 56.325 37.0313 55.2375 38.55L66 46.9875V42C66 38.6812 63.3187 36 60 36ZM107.831 0C104.518 0 101.831 2.68687 101.831 6V75.2063L113.831 84.6113V6C113.831 2.68687 111.319 0 107.831 0ZM78 90C78 93.3131 80.6869 96 84 96C87.3131 96 90 93.3131 90 90V88.6684L78 79.2634V90ZM84 18C80.6869 18 78 20.6869 78 24V56.3813L90 65.7862V24C90 20.6812 87.3187 18 84 18Z" fill="currentColor"/></g><defs><clipPath id="clip0_5510_497"><rect width="120" height="96" fill="white"/></clipPath></defs></svg>
    </div>
         <span id="message">
       <p>📚 StudySync is offline<br/>📖 Your study data is safe locally</p>
     </span>
     <button id="retryButton" type="button" onclick="retryConnection()">🔄 Resume Studying</button>
  </div>
  <script>
    var message = document.getElementById('message');
    var retryButton = document.getElementById('retryButton')
         if (['ko', 'ko-kr', 'ko-kp'].indexOf(navigator.language.toLowerCase()) > -1) {
       // Korean
       message.innerHTML = '<p>📚 StudySync가 오프라인입니다<br/>📖 학습 데이터는 로컬에 안전하게 저장됩니다</p>';
       retryButton.innerText = '🔄 학습 재개';
     }
         function retryConnection() {
       retryButton.textContent = '🔍 Checking...';
       retryButton.disabled = true;
       fetch('/favicon.ico', { method: 'HEAD', cache: 'no-cache' })
         .then(response => {
           if (response.ok) {
             retryButton.textContent = '✅ Connected!';
             setTimeout(() => { window.location.href = '/?tab=home'; }, 1000);
           }
         })
         .catch(() => {
           retryButton.textContent = '❌ Still Offline';
           setTimeout(() => {
             retryButton.textContent = '🔄 Resume Studying';
             retryButton.disabled = false;
           }, 2000);
         });
     }
    function updateDarkMode(){
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute("data-theme", "dark");
      }
      else {
        document.documentElement.setAttribute("data-theme", "light");
      } 
    }
    updateDarkMode();
    if(window.matchMedia){
      window.matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', updateDarkMode);
    }
  </script>
</body>
</html>
```

## 🎨 **Features of This Simple Themed Offline Page:**

### **Visual Design:**
- **StudySync Branding**: Blue gradient theme matching the app
- **Simple Layout**: Clean, minimal interface
- **Responsive Design**: Works on all devices
- **Professional Appearance**: Consistent with app theme

### **Functionality:**
- **Dark/Light Mode**: Automatic theme detection
- **Refresh Button**: Smart connection testing
- **Auto-Redirect**: Returns to app when online
- **Status Updates**: Visual feedback during connection check

### **User Experience:**
- **Clear Messaging**: Simple offline information
- **Easy Navigation**: Single refresh button
- **Seamless Transitions**: Smooth online/offline handling

This offline HTML file provides a **simple, branded experience** that perfectly matches your StudySync app's design! 🎉
