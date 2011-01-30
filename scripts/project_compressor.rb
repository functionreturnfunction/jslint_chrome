require File.dirname(__FILE__) + '/compressor'
require 'zip/zip'

class ProjectCompressor
  REQUIRED_OPTS = {
    # Array of the scripts to be concatenated, in the order that they need to be
    # loaded, preventing any dependency issues.  Each item should either be a
    # string referring to the name of a script in the output directory, or a
    # hash in the form {:compress => 'path/to/script.js'}
    :scripts => 'Script array is required.',
    # Name of the script to write to in the output directory.
    :output_script => 'Output script name is required.',
    # Name of the html file that needs to have references from the original
    # scripts redone to point to the concatenated single script.
    :page => 'Html page file name is required.',
    # String containing the relative or fully qualified path name to the
    # directory containing the project files and where they should be written
    # from/to.
    :directory => 'Input/Output directory name is required.'
  }
  OPTIONAL_OPTS = [
    # Optional string containing the name to use for the 
    :output_file
  ]
  OPTS = OPTIONAL_OPTS + REQUIRED_OPTS.keys

  def initialize opts = {}
    parse_options opts
  end

  def compress
    validate_options

    File.open(fix_filename(@output_script), 'w') do |outfile|
      @scripts.each do |script|
        if script.class == String
          script = fix_filename script
          add_file script, outfile
        elsif script[:compress]
          script = fix_filename script[:compress]
          compress_and_add_file script, outfile
        end

        rm script
        script
      end
      fix_page
      compress_project
    end
  end

  class << self
    def compress &block
      compressor = ProjectCompressor.new
      yield compressor
      compressor.compress
    end
  end

  OPTS.each do |name|
    define_method(name.intern) do |arg|
      instance_variable_set "@#{name}".intern, arg
    end
  end

  def output_file file = false
    if file
      @output_file = file
    else
      fix_filename(@output_file || generate_output_file)
    end
  end

  private

  def add_file filename, outfile
    outfile.write(File.read(filename))
  end

  def compress_and_add_file filename, outfile
    Compressor.compress filename
    add_file filename, outfile
  end

  def generate_output_file
    "release-#{Time.now.strftime('%Y-%m-%d-%H%M')}.zip"
  end

  def compress_project
    Zip::ZipFile.open(output_file, 'w') do |zip|
      FileList["#{@directory}/**"].each do |file|
        zip.add(file.sub("#{@directory}/", ''), file)
      end
    end
  end

  def fix_filename filename
    "#{@directory}/#{filename}"
  end

  def fix_page
    @page = fix_filename(@page)
    first = true
    page = File.read(@page).gsub(scripts_rgx) do |s|
      if first
        first = false
        "<script src=\"#{@output_script}\"></script>"
      else
        ''
      end
    end
    File.open(@page, 'w') { |f| f.write(page) }
  end

  def scripts_rgx
    Regexp.new("(<script [^>]*src=\"(#{@scripts.join('|')})\".+?</script>)")
  end

  def parse_options opts
    OPTS.each do |name|
      instance_variable_set "@#{name}".intern, opts[name]
    end
  end

  def validate_options
    REQUIRED_OPTS.each do |name, message|
      raise message unless 
        instance_variable_get "@#{name}".intern
    end
  end
end
