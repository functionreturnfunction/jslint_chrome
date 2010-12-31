SCRIPTS = {
  :content => 'content.js'
}
SOURCE_DIRECTORY = 'src'
SOURCE_SCRIPTS = {
  :content => "#{SOURCE_DIRECTORY}/#{SCRIPTS[:content]}"
}
OUTPUT_DIRECTORY = 'output'
OUTPUT_SCRIPTS = {
  :content => "#{OUTPUT_DIRECTORY}/#{SCRIPTS[:content]}"
}

require 'rake/clean'

CLOBBER.include OUTPUT_DIRECTORY

directory OUTPUT_DIRECTORY

file OUTPUT_SCRIPTS[:content] => [OUTPUT_DIRECTORY] do
  open(OUTPUT_SCRIPTS[:content], 'w') do |outfile|
    outfile.puts '(function(){'
    open(SOURCE_SCRIPTS[:content]) do |infile|
      infile.each {|line| outfile.puts(line) }
    end
    outfile.puts 'initListener();'
    outfile.puts '})();'
  end
end

task :build => [:clobber].concat(OUTPUT_SCRIPTS.values)

