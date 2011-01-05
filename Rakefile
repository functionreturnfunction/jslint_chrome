LIBRARIES = {
  :jslint => 'fulljslint.js'
}
FILES = {
  :copying => 'COPYING',
  :icon => 'icon.png',
  :manifest => 'manifest.json',
  :popup => 'popup.html',
  :popup_css => 'popup.css'
}
SCRIPTS = {
  :content => 'content.js',
  :popup_js => 'popup.js'
}
CONTENT_DIRECTORY = 'content'
SOURCE_DIRECTORY = 'src'
LIBRARY_DIRECTORY = 'lib'
SOURCE_FILES = {
  :content => "#{SOURCE_DIRECTORY}/#{SCRIPTS[:content]}",
  :copying => FILES[:copying],
  :popup => "#{CONTENT_DIRECTORY}/#{FILES[:popup]}",
  :popup_css => "#{CONTENT_DIRECTORY}/#{FILES[:popup_css]}",
  :popup_js => "#{SOURCE_DIRECTORY}/#{SCRIPTS[:popup_js]}",
  :icon => "#{CONTENT_DIRECTORY}/#{FILES[:icon]}",
  :jslint => "#{LIBRARY_DIRECTORY}/#{LIBRARIES[:jslint]}",
  :manifest => "#{CONTENT_DIRECTORY}/#{FILES[:manifest]}"
}
OUTPUT_DIRECTORY = 'output'
OUTPUT_FILES = {
  :copying => "#{OUTPUT_DIRECTORY}/#{FILES[:copying]}",
  :content => "#{OUTPUT_DIRECTORY}/#{SCRIPTS[:content]}",
  :popup => "#{OUTPUT_DIRECTORY}/#{FILES[:popup]}",
  :popup_css => "#{OUTPUT_DIRECTORY}/#{FILES[:popup_css]}",
  :popup_js => "#{OUTPUT_DIRECTORY}/#{SCRIPTS[:popup_js]}",
  :icon => "#{OUTPUT_DIRECTORY}/#{FILES[:icon]}",
  :jslint => "#{OUTPUT_DIRECTORY}/#{LIBRARIES[:jslint]}",
  :manifest => "#{OUTPUT_DIRECTORY}/#{FILES[:manifest]}"
}

def build_script_file_with_listeners name, extra_call = nil
  puts "building #{OUTPUT_FILES[name]}"
  open(OUTPUT_FILES[name], 'w') do |outfile|
    outfile.puts '(function(){'
    open(SOURCE_FILES[name]) do |infile|
      infile.each {|line| outfile.puts(line) }
    end
    outfile.puts extra_call if !extra_call.nil?
    outfile.puts '})();'
  end
end

require 'rake/clean'

CLOBBER.include OUTPUT_DIRECTORY

directory OUTPUT_DIRECTORY

file OUTPUT_FILES[:content] => [OUTPUT_DIRECTORY] do
  build_script_file_with_listeners :content, 'initialize();'
end

file OUTPUT_FILES[:popup_js] => [OUTPUT_DIRECTORY] do
  build_script_file_with_listeners :popup_js, 'Popup.initialize();'
end

OUTPUT_FILES.each do |f, name|
  next if [:content, :popup_js].include? f
  file name => [OUTPUT_DIRECTORY] do
    cp SOURCE_FILES[f], name
  end
end

task :build => [:clobber].concat(OUTPUT_FILES.values)
