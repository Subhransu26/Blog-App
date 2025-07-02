import { motion } from "framer-motion";

function About() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-extrabold text-center mb-8"
        >
          About <span className="text-purple-600">Blog App</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg leading-relaxed text-center mb-6 max-w-3xl mx-auto"
        >
          Blog App is a modern blogging platform built for creators and readers. Whether
          you're here to publish your ideas or discover inspiring content, we’re making
          blogging accessible, beautiful, and community-driven.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid md:grid-cols-2 gap-8 mt-12"
        >
          <div className="p-6 rounded-xl shadow-lg bg-gray-100 dark:bg-gray-800 transition duration-300">
            <h3 className="text-xl font-semibold mb-2 text-purple-600">For Writers</h3>
            <p>
              Share your thoughts, stories, tutorials, or experiences with a growing
              audience. Focus on content—our clean UI and simple editor handle the rest.
            </p>
          </div>

          <div className="p-6 rounded-xl shadow-lg bg-gray-100 dark:bg-gray-800 transition duration-300">
            <h3 className="text-xl font-semibold mb-2 text-pink-500">For Readers</h3>
            <p>
              Discover fresh perspectives, follow your favorite bloggers, and dive into
              curated content across various topics—tailored to your interests.
            </p>
          </div>

          <div className="p-6 rounded-xl shadow-lg bg-gray-100 dark:bg-gray-800 transition duration-300">
            <h3 className="text-xl font-semibold mb-2 text-indigo-500">Built With Love</h3>
            <p>
              Created using React, Tailwind CSS, and Node.js, Blog App focuses on speed,
              security, and scalability—so you can enjoy the experience without worries.
            </p>
          </div>

          <div className="p-6 rounded-xl shadow-lg bg-gray-100 dark:bg-gray-800 transition duration-300">
            <h3 className="text-xl font-semibold mb-2 text-emerald-500">Join the Community</h3>
            <p>
              We're more than a platform—we’re a network of creators, learners, and
              readers who believe in the power of writing to connect the world.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default About;
