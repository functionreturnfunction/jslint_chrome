require 'rake/clean'

TEST_PAGE = 'test/unit/tests.html'
CONTENT_DIRECTORY = 'content'
SOURCE_DIRECTORY = 'src'
LIBRARY_DIRECTORY = 'lib'
OUTPUT_DIRECTORY = 'output'
LIBRARIES = FileList["#{LIBRARY_DIRECTORY}/*"]
FILES = FileList["#{CONTENT_DIRECTORY}/**/*"].include 'COPYING'
SPECIAL_SCRIPTS = {
  :content => 'content.js',
  :popup_js => 'popup.js'
}
SCRIPT_INPUT = SPECIAL_SCRIPTS \
  .inject({}) {|memo, arr| memo[arr[0]] = "#{SOURCE_DIRECTORY}/#{arr[1]}"; memo}
SCRIPT_OUTPUT = SPECIAL_SCRIPTS \
  .inject({}) {|memo, arr| memo[arr[0]] = "#{OUTPUT_DIRECTORY}/#{arr[1]}"; memo}
SCRIPTS = FileList["#{SOURCE_DIRECTORY}/*"].exclude *(SCRIPT_INPUT.values)

SOURCE_FILES = LIBRARIES + FILES + SCRIPTS

directory OUTPUT_DIRECTORY

OUTPUT_FILES = SOURCE_FILES.map do |file|
  outfile = OUTPUT_DIRECTORY + file.sub(/(.+\/)?([^\/])/, '/\2')
  file outfile => [OUTPUT_DIRECTORY] do
    cp(file, outfile) unless File.directory?(file)
  end
end

CLOBBER.include OUTPUT_DIRECTORY

def build_script_file_with_listeners name, extra_call = nil
  $stderr.puts "building #{SCRIPT_OUTPUT[name]}"
  open(SCRIPT_OUTPUT[name], 'w') do |outfile|
    open(SCRIPT_INPUT[name]) do |infile|
      infile.each {|line| outfile.puts(line) }
    end
    outfile.puts extra_call if !extra_call.nil?
  end
end

file SCRIPT_OUTPUT[:content] => [OUTPUT_DIRECTORY] do
  build_script_file_with_listeners :content, 'Content.initialize();'
end

file SCRIPT_OUTPUT[:popup_js] => [OUTPUT_DIRECTORY] do
  build_script_file_with_listeners :popup_js, 'Popup.initialize();'
end

task :build => [:clobber].concat(OUTPUT_FILES + SCRIPT_OUTPUT.values)

task :test do
  `google-chrome #{TEST_PAGE}`
end
