use std::env;
use std::error::Error;
use std::path::PathBuf;

fn main() -> Result<(), Box<dyn Error>> {
    let out_dir = PathBuf::from(env::var("OUT_DIR").unwrap());
    println!("cargo:rustc-link-search={}", out_dir.display());
    tonic_build::configure().
        file_descriptor_set_path(out_dir.join("server_descriptor.bin"))
        .compile_protos(&["src/proto/ping.proto", "src/proto/events.proto", "src/proto/auth.proto"], &["src/proto/"])?;
    tonic_build::compile_protos("src/proto/events.proto")?;
    tonic_build::compile_protos("src/proto/ping.proto")?;
    tonic_build::compile_protos("src/proto/auth.proto")?;
    Ok(())
}
