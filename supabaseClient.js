import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

import { supabase } from '@/lib/supabaseClient';

const handleSubmit = async () => {
  const { data, error } = await supabase.from('rooftops').insert([
    {
      owner_name: name,
      phone,
      location,
      size: parseInt(size),
      description,
      image_url: 'https://placehold.co/400x200' // optional for now
    }
  ]);

  if (error) {
    alert('Error submitting');
  } else {
    alert('Rooftop submitted!');
  }
};


useEffect(() => {
    const fetchRooftops = async () => {
      const { data, error } = await supabase.from('rooftops').select('*');
      setRooftops(data);
    };
    fetchRooftops();
  }, []);

  
  import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MapPin, Leaf, UserPlus, Trash2 } from "lucide-react";

export default function AdoptARooftopApp() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [size, setSize] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [rooftops, setRooftops] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleImageUpload = async () => {
    const file = image;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from("rooftop-images")
      .upload(fileName, file);
    if (error) throw error;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/rooftop-images/${fileName}`;
  };

  const handleSubmit = async () => {
    let imageUrl = "";
    if (image) imageUrl = await handleImageUpload();

    const { error } = await supabase.from("rooftops").insert([
      {
        owner_name: name,
        phone,
        location,
        size: parseInt(size),
        description,
        image_url: imageUrl
      }
    ]);

    if (error) {
      alert("Error submitting");
    } else {
      alert("Rooftop submitted!");
      setName(""); setPhone(""); setLocation(""); setSize(""); setDescription(""); setImage(null);
      fetchRooftops();
    }
  };

  const fetchRooftops = async () => {
    const { data, error } = await supabase.from("rooftops").select("*");
    if (!error) setRooftops(data);
  };

  const handleDelete = async (id) => {
    await supabase.from("rooftops").delete().eq("id", id);
    fetchRooftops();
  };

  useEffect(() => {
    fetchRooftops();
    const subscription = supabase
      .channel('rooftop_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooftops' }, fetchRooftops)
      .subscribe();
    return () => { supabase.removeChannel(subscription); };
  }, []);

  const filteredRooftops = rooftops.filter((rt) =>
    rt.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <h1 className="text-4xl font-bold text-green-700 text-center mb-6">
        Adopt a Rooftop 🌿
      </h1>

      <Tabs defaultValue="adopt" className="max-w-5xl mx-auto">
        <TabsList className="grid grid-cols-3 w-full mb-6">
          <TabsTrigger value="adopt"><Leaf className="mr-2" /> Adopt Rooftop</TabsTrigger>
          <TabsTrigger value="list"><MapPin className="mr-2" /> List Rooftop</TabsTrigger>
          <TabsTrigger value="admin"><UserPlus className="mr-2" /> Admin Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="adopt">
          <Card>
            <CardContent className="space-y-4 p-6">
              <Input
                placeholder="Search rooftops by area"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRooftops.map((rt) => (
                  <Card key={rt.id} className="bg-white shadow-md">
                    <CardContent className="p-4">
                      <img src={rt.image_url} alt="Rooftop" className="w-full h-40 object-cover rounded-lg mb-3" />
                      <p className="text-lg font-semibold">Location: {rt.location}</p>
                      <p>Size: {rt.size} sqft</p>
                      <p>Contact: {rt.phone}</p>
                      <Button className="mt-3 w-full">Adopt</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardContent className="space-y-4 p-6">
              <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
              <Input placeholder="Size (sqft)" value={size} onChange={(e) => setSize(e.target.value)} />
              <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
              <Input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
              <Button className="w-full" onClick={handleSubmit}><UserPlus className="mr-2" /> Submit Rooftop</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin">
          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="text-2xl font-semibold">All Rooftops</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rooftops.map((rt) => (
                  <Card key={rt.id} className="bg-white shadow-md">
                    <CardContent className="p-4">
                      <img src={rt.image_url} alt="Rooftop" className="w-full h-40 object-cover rounded-lg mb-3" />
                      <p><strong>Name:</strong> {rt.owner_name}</p>
                      <p><strong>Phone:</strong> {rt.phone}</p>
                      <p><strong>Location:</strong> {rt.location}</p>
                      <p><strong>Size:</strong> {rt.size} sqft</p>
                      <p><strong>Description:</strong> {rt.description}</p>
                      <Button variant="destructive" className="mt-3" onClick={() => handleDelete(rt.id)}>
                        <Trash2 className="mr-2" /> Delete
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
