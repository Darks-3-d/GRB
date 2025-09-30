My Comics WebsiteThis is a simple, self-hosted comic reader website that loads comic data from local JSON files. It's designed to be easily deployed on static hosting services like GitHub Pages or Netlify.Project StructureYour project should have the following file structure:/
├── index.html            <-- The main page
├── comics.json           <-- The "master list" of all your comics
├── README.md             <-- These instructions
│
├── js/
│   └── main.js           <-- All the website's functionality
│
└── comics/
    ├── my-first-comic.json  <-- Data for one comic
    └── another-comic.json <-- Data for another comic
How to Add a New ComicFollow these three steps to add a new comic series to your website.Step 1: Get Your Image URLsBefore you begin, upload your comic pages and cover image to a public host. GitHub is a great option for this.Create a public GitHub repository to store your images.Upload your cover and page files.For each image, you need its "raw" URL. To get this, navigate to the image on GitHub and click the "Download" or "Raw" button. Copy the URL from your browser's address bar. It will look like this: https://raw.githubusercontent.com/YourUsername/RepoName/main/path/to/image.jpg.Step 2: Create a New Comic JSON FileIn the comics/ folder, create a new file. The name should be unique and end with .json (e.g., space-adventure.json).Copy the structure from one of the existing comic JSON files (like my-first-comic.json) and paste it into your new file.Edit the contents with your new comic's information:id: A unique identifier (e.g., "space-adventure").title: The full title of your comic.description: A summary.coverImage: The raw URL to your cover image.chapters: A list of chapters. Each chapter needs a chapter number, title, publishDate, and a pages array containing the raw URLs for each page, in order.Step 3: Update the Master ListOpen the main comics.json file in the root of your project.Add a new entry to the list that points to the file you just created.For example, if you created comics/space-adventure.json, you would add a new line to comics.json:[
  {
    "path": "comics/my--first-comic.json"
  },
  {
    "path": "comics/another-comic.json"
  },
  {
    "path": "comics/space-adventure.json"  <-- ADD THIS LINE
  }
]
That's it! Save your files, upload them to your host, and your new comic will appear on the website.