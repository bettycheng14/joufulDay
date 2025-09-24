require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const enquiryRoutes = require("./routes/enquiryRoutes");
const Tour = require("./models/Tour");
const User = require("./models/User");

const app = express();
const port = process.env.PORT || 3000;

// use ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public_html/views"));
app.use(morgan("tiny"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public_html")));

// Connect to MongoDB
if (!process.env.MONGO_URI) {
	console.error("Please set MONGO_URI in .env");
	process.exit(1);
}
mongoose
	.connect(process.env.MONGO_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log("✅ Connected to MongoDB Atlas"))
	.catch((err) => {
		console.error("❌ MongoDB error:", err);
		process.exit(1);
	});

// sessions
app.use(
	session({
		secret: process.env.SESSION_SECRET || "devsecret",
		resave: false,
		saveUninitialized: false,
		cookie: { maxAge: 1000 * 60 * 60 * 2 }, // 2 hours
	})
);

// save user details in session
app.use((req, res, next) => {
	res.locals.user = req.session.user || null;
	next();
});

// Routes
app.use("/", authRoutes);
app.use("/", enquiryRoutes);

app.get("/", async (req, res) => {
	try {
		let tours = await Tour.find();
		// Sort by rating (descending) to show top tours
		tours.sort((a, b) => (b.rating || 0) - (a.rating || 0));
		// Top 6 tours
		tours = tours.slice(0, 6);
		const categories = await Tour.distinct("category");

		res.render("home", {
			title: "Home - JoyfulDay",
			activePage: "home",
			tours,
			categories,
		});
	} catch (err) {
		console.error("Error loading homepage:", err);
		res.status(500).send("Server Error");
	}
});

app.get("/about", (req, res) => {
	res.render("about", { title: "About Us - JoyfulDay", activePage: "about" });
});

app.get("/blog", (req, res) => {
	res.render("blog", { title: "Blog - JoyfulDay", activePage: "blog" });
});

app.get("/blog-detail", (req, res) => {
	res.render("blog-detail", {
		title: "Blogs - JoyfulDay",
		activePage: "blog",
	});
});

// destinations
app.get("/destinations", async (req, res) => {
	try {
		const searchQuery = req.query.q || "";
		const selectedCategory = req.query.category || "";
		const priceMin = parseFloat(req.query.priceMin) || 0;
		const priceMax = parseFloat(req.query.priceMax) || 10000;
		const page = parseInt(req.query.page) || 1;
		const limit = 9;

		// Filters
		const filter = {
			price: { $gte: priceMin, $lte: priceMax },
		};
		if (searchQuery) filter.title = { $regex: searchQuery, $options: "i" };
		if (selectedCategory) filter.category = selectedCategory;

		const totalTours = await Tour.countDocuments(filter);
		const totalPages = Math.ceil(totalTours / limit);

		const tours = await Tour.find(filter)
			.sort({ createdAt: -1 })
			.skip((page - 1) * limit)
			.limit(limit)
			.lean();

		// Calculate min/max price for filter input
		const priceStats = await Tour.aggregate([
			{ $match: filter },
			{
				$group: {
					_id: null,
					minPrice: { $min: "$price" },
					maxPrice: { $max: "$price" },
				},
			},
		]);

		const minPriceVal = priceStats[0]?.minPrice || 0;
		const maxPriceVal = priceStats[0]?.maxPrice || 1000;

		// unique category list based on current result
		const categories = [
			...new Set(
				(await Tour.find(filter)).map((t) => t.category).filter(Boolean)
			),
		];
		res.render("destinations", {
			title: "Destinations - JoyfulDay",
			activePage: "destinations",
			tours,
			searchQuery,
			selectedCategory,
			minPrice: minPriceVal,
			maxPrice: maxPriceVal,
			categories,
			currentPage: page,
			totalPages,
		});
	} catch (err) {
		console.error(err);
		res.status(500).send("Error loading destinations");
	}
});

// Tour details page
app.get("/tour/:id", async (req, res) => {
	const user = await User.findById(req.session.user?.id).populate(
		"bookmarkedTours"
	);

	const tour = await Tour.findById(req.params.id);
	if (!tour) return res.status(404).send("Tour not found");
	res.render("tour-details", { user, activePage: "destinations", tour });
});

// Book a tour
app.post("/tour/:id/book", async (req, res) => {
	try {
		// Ensure user is logged in
		if (!req.session.user)
			return res.status(401).send("Please log in first.");
		console.log({ user: req.session.user });

		const tourId = req.params.id;

		// Find user in DB
		const user = await User.findById(req.session.user.id);
		if (!user) {
			console.log("no user", user);
			req.session.destroy(); // clear invalid session
			return res.redirect("/login");
		}

		// Check if tour exists
		const tour = await Tour.findById(tourId);
		if (!tour) return res.status(404).send("Tour not found.");

		// Avoid duplicate bookmarks
		if (!user.bookmarkedTours.includes(tourId)) {
			user.bookmarkedTours.push(tourId);
			await user.save();
		}

		res.redirect("/member-information");
	} catch (err) {
		console.error(err);
		res.status(500).send("Error bookmarks tour.");
	}
});

// 404 handler
app.use((req, res) => {
  res.status(404).render("error", {
	activePage: "",

    status: 404,
    title: "Page Not Found",
    message: "The page you are looking for does not exist."
  });
});

// General error handler
app.use((error, req, res, next) => {
  const status = error.status || 500;
  let title;

  switch (status) {
    case 400:
      title = "Bad Request";
      break;
    case 401:
      title = "Unauthorized";
      break;
    case 403:
      title = "Forbidden";
      break;
    default:
      title = "Internal Server Error";
  }

  res.status(status).render("error", {
	activePage: "",
    status,
    title,
    message: error.message || "An unexpected error occurred."
  });
});

app.listen(port, () =>
	console.log(`Web server running at: http://localhost:${port}`)
);
