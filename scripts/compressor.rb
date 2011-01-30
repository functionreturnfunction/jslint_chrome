require 'yui/compressor'

class Compressor
  RGX_HEADER = /^(\/\*.+?\*\/)/m

  def initialize file
    @file = file
  end

  def compress
    script = File.read @file
    header = RGX_HEADER.match(script)[1]
    File.open(@file, 'w') do |f|
      f.puts(header)
      f.write(YUI::JavaScriptCompressor.new(:munge => true).compress(script))
    end
  end

  class << self
    def compress file
      Compressor.new(file).compress
    end
  end
end
