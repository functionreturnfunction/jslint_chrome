LIBRARIES = {
  :jslint => 'fulljslint.js'
}
FILES = {
  :background => 'background.html',
  :icon => 'icon.png',
  :manifest => 'manifest.json'
}
SCRIPTS = {
  :content => 'content.js',
  :dom => 'dom.js'
}
CONTENT_DIRECTORY = 'content'
SOURCE_DIRECTORY = 'src'
LIBRARY_DIRECTORY = 'lib'
SOURCE_FILES = {
  :background => "#{CONTENT_DIRECTORY}/#{FILES[:background]}",
  :content => "#{SOURCE_DIRECTORY}/#{SCRIPTS[:content]}",
  :dom => "#{SOURCE_DIRECTORY}/#{SCRIPTS[:dom]}",
  :icon => "#{CONTENT_DIRECTORY}/#{FILES[:icon]}",
  :jslint => "#{LIBRARY_DIRECTORY}/#{LIBRARIES[:jslint]}",
  :manifest => "#{CONTENT_DIRECTORY}/#{FILES[:manifest]}"
}
OUTPUT_DIRECTORY = 'output'
OUTPUT_FILES = {
  :background => "#{OUTPUT_DIRECTORY}/#{FILES[:background]}",
  :content => "#{OUTPUT_DIRECTORY}/#{SCRIPTS[:content]}",
  :dom => "#{OUTPUT_DIRECTORY}/#{SCRIPTS[:dom]}",
  :icon => "#{OUTPUT_DIRECTORY}/#{FILES[:icon]}",
  :jslint => "#{OUTPUT_DIRECTORY}/#{LIBRARIES[:jslint]}",
  :manifest => "#{OUTPUT_DIRECTORY}/#{FILES[:manifest]}"
}

def build_script_file_with_listeners name, namespace = ''
  puts "building #{OUTPUT_FILES[name]}"
  open(OUTPUT_FILES[name], 'w') do |outfile|
    outfile.puts '(function(){'
    open(SOURCE_FILES[name]) do |infile|
      infile.each {|line| outfile.puts(line) }
    end
    outfile.puts "#{namespace}initListeners();"
    outfile.puts '})();'
  end
end

require 'rake/clean'

CLOBBER.include OUTPUT_DIRECTORY

directory OUTPUT_DIRECTORY

file OUTPUT_FILES[:content] => [OUTPUT_DIRECTORY] do
  build_script_file_with_listeners :content
end

file OUTPUT_FILES[:dom] => [OUTPUT_DIRECTORY] do
  build_script_file_with_listeners :dom, 'DOM.'
end

OUTPUT_FILES.each do |f, name|
  next if [:content, :dom].include? f
  file name => [OUTPUT_DIRECTORY] do
    cp SOURCE_FILES[f], name
  end
end

task :build => [:clobber].concat(OUTPUT_FILES.values)
