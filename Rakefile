require 'rake/clean'

CONTENT_DIRECTORY = 'content'
SOURCE_DIRECTORY = 'src'
LIBRARY_DIRECTORY = 'lib'
OUTPUT_DIRECTORY = 'output'
LIBRARIES = FileList["#{LIBRARY_DIRECTORY}/*"]
FILES = FileList["#{CONTENT_DIRECTORY}/**/*"].include 'COPYING'
SOURCE_FILES = LIBRARIES + FILES
SCRIPTS = {
  :content => 'content.js',
  :popup_js => 'popup.js'
}
SCRIPT_INPUT = SCRIPTS \
  .inject({}) {|memo, arr| memo[arr[0]] = "#{SOURCE_DIRECTORY}/#{arr[1]}"; memo}
SCRIPT_OUTPUT = SCRIPTS \
  .inject({}) {|memo, arr| memo[arr[0]] = "#{OUTPUT_DIRECTORY}/#{arr[1]}"; memo}

directory OUTPUT_DIRECTORY

OUTPUT_FILES = SOURCE_FILES.map do |file|
  outfile = OUTPUT_DIRECTORY + file.sub(/(.+\/)?([^\/])/, '/\2')
  file outfile => [OUTPUT_DIRECTORY] do
    unless File.directory?(file)
      puts "creating file #{outfile} from #{file}"
      cp(file, outfile)
    end
  end
end

CLOBBER.include OUTPUT_DIRECTORY

def build_script_file_with_listeners name, extra_call = nil
  puts "building #{SCRIPT_OUTPUT[name]}"
  open(SCRIPT_OUTPUT[name], 'w') do |outfile|
    outfile.puts '(function(){'
    open(SCRIPT_INPUT[name]) do |infile|
      infile.each {|line| outfile.puts(line) }
    end
    outfile.puts extra_call if !extra_call.nil?
    outfile.puts '})();'
  end
end

file SCRIPT_OUTPUT[:content] => [OUTPUT_DIRECTORY] do
  build_script_file_with_listeners :content, 'initialize();'
end

file SCRIPT_OUTPUT[:popup_js] => [OUTPUT_DIRECTORY] do
  build_script_file_with_listeners :popup_js, 'Popup.initialize();'
end

task :build => [:clobber].concat(OUTPUT_FILES + SCRIPT_OUTPUT.values)
