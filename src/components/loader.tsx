"use client"

import React from 'react'
import { motion } from 'framer-motion'

export default function InnovativeLoader() {

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <motion.div
        className="text-4xl font-bold mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        cp-judge
      </motion.div>

      <div className="relative w-16 h-16 mb-8">
        <motion.div
          className="absolute inset-0 rounded-full border-t-4 border-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </div>

    </div>
  )
}

