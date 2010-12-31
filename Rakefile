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
SOURCE_FILES = {
  :background => "#{CONTENT_DIRECTORY}/#{FILES[:background]}",
  :content => "#{SOURCE_DIRECTORY}/#{SCRIPTS[:content]}",
  :dom => "#{SOURCE_DIRECTORY}/#{SCRIPTS[:dom]}",
  :icon => "#{CONTENT_DIRECTORY}/#{FILES[:icon]}",
  :manifest => "#{CONTENT_DIRECTORY}/#{FILES[:manifest]}"
}
OUTPUT_DIRECTORY = 'output'
OUTPUT_FILES = {
  :background => "#{OUTPUT_DIRECTORY}/#{FILES[:background]}",
  :content => "#{OUTPUT_DIRECTORY}/#{SCRIPTS[:content]}",
  :dom => "#{OUTPUT_DIRECTORY}/#{SCRIPTS[:dom]}",
  :icon => "#{OUTPUT_DIRECTORY}/#{FILES[:icon]}",
  :manifest => "#{OUTPUT_DIRECTORY}/#{FILES[:manifest]}"
}

require 'rake/clean'

CLOBBER.include OUTPUT_DIRECTORY

directory OUTPUT_DIRECTORY

file OUTPUT_FILES[:content] => [OUTPUT_DIRECTORY] do
  open(OUTPUT_FILES[:content], 'w') do |outfile|
    outfile.puts '(function(){'
    open(SOURCE_FILES[:content]) do |infile|
      infile.each {|line| outfile.puts(line) }
    end
    outfile.puts 'initListener();'
    outfile.puts '})();'
  end
end

OUTPUT_FILES.each do |f, name|
  next if f == :content
  file name => [OUTPUT_DIRECTORY] do
    cp SOURCE_FILES[f], name
  end
end

task :build => [:clobber].concat(OUTPUT_FILES.values)
