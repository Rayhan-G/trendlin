#!/usr/bin/env node

// scripts/export-files.js
const fs = require('fs')
const path = require('path')

const extensions = ['.js', '.jsx', '.ts', '.tsx', '.css', '.json', '.md', '.mdx']
const excludeDirs = ['node_modules', '.next', 'out', 'build', 'dist', '.git', '.cache', 'coverage']

function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList
  
  const files = fs.readdirSync(dir)
  
  files.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    
    if (stat.isDirectory()) {
      if (!excludeDirs.includes(file) && !file.startsWith('.')) {
        getAllFiles(filePath, fileList)
      }
    } else {
      if (extensions.includes(path.extname(file))) {
        fileList.push(filePath)
      }
    }
  })
  
  return fileList
}

function generateExport() {
  console.log('Scanning project files...')
  
  const directoriesToScan = [
    './src',
    './public',
    './scripts'
  ]
  
  let allFiles = []
  directoriesToScan.forEach(dir => {
    if (fs.existsSync(dir)) {
      allFiles = getAllFiles(dir, allFiles)
    }
  })
  
  // Also include root config files
  const rootFiles = [
    'package.json',
    'package-lock.json',
    'next.config.js',
    'tailwind.config.js',
    'postcss.config.js',
    'jsconfig.json',
    '.env.local',
    '.gitignore'
  ]
  
  rootFiles.forEach(file => {
    if (fs.existsSync(file)) {
      allFiles.push(file)
    }
  })
  
  // Sort files alphabetically
  allFiles.sort()
  
  console.log(`Found ${allFiles.length} files to export`)
  
  const output = []
  const timestamp = new Date().toISOString()
  
  output.push(`// ============================================`)
  output.push(`// PROJECT EXPORT - ${timestamp}`)
  output.push(`// Total files: ${allFiles.length}`)
  output.push(`// ============================================`)
  output.push('')
  
  allFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8')
      output.push(`\n========== ${file} ==========\n`)
      output.push(content)
      output.push('\n')
    } catch (error) {
      console.error(`Error reading ${file}:`, error.message)
      output.push(`\n========== ${file} ==========\n`)
      output.push(`// Error reading file: ${error.message}\n`)
    }
  })
  
  const exportFile = 'project-export.txt'
  fs.writeFileSync(exportFile, output.join(''))
  console.log(`✅ Exported to ${exportFile}`)
  console.log(`📊 Total size: ${(fs.statSync(exportFile).size / 1024 / 1024).toFixed(2)} MB`)
}

// Run the export
generateExport()