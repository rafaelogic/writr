<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Writr Editor Demo</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen">
    <div class="container mx-auto px-4 py-8 max-w-4xl">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-8 p-6">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900">Writr Editor Demo</h1>
                    <p class="text-sm text-gray-600 mt-1">Test the editor with customizable settings</p>
                </div>
                <div class="flex space-x-3">
                    <a href="/writr/settings" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Settings
                    </a>
                </div>
            </div>
        </div>

        <!-- Editor Form -->
        <form action="#" method="POST" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            @csrf
            
            <div class="mb-6">
                <label for="title" class="block text-sm font-medium text-gray-700 mb-2">Article Title</label>
                <input type="text" id="title" name="title" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       placeholder="Enter your article title">
            </div>

            <div class="mb-6">
                <label for="content" class="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <x-writr-editor 
                    name="content" 
                    id="demo-editor"
                    placeholder="Start writing your article..." 
                    class="border border-gray-300 rounded-lg"
                />
            </div>

            <div class="flex items-center justify-between">
                <div class="text-sm text-gray-500">
                    Changes will automatically be saved as you type
                </div>
                <div class="flex space-x-3">
                    <button type="button" onclick="exportContent()" 
                            class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                        Export
                    </button>
                    <button type="submit" 
                            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Save Article
                    </button>
                </div>
            </div>
        </form>
    </div>

    <script>
        // Export functionality
        function exportContent() {
            if (window.currentEditor) {
                window.currentEditor.save().then((outputData) => {
                    const dataStr = JSON.stringify(outputData, null, 2);
                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'article-content.json';
                    link.click();
                    URL.revokeObjectURL(url);
                });
            }
        }

        // Listen for editor ready event
        window.addEventListener('writrEditorReady', function(e) {
            console.log('Editor ready:', e.detail);
        });
    </script>
</body>
</html>
